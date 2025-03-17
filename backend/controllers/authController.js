const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/mailer");
const { generateOTP } = require("../utils/otpGenerator");

// l'inscription d'un utilisateur
exports.register = async (req, res) => {
  const {
    name,
    email,
    password,
    phoneNumber,
    role,
    institution,
    specialty,
    profileImage,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      institution,
      specialty,
      profileImage,
    });

    await user.save();

    // Génération du token de vérification
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    user.verificationToken = verificationToken;
    await user.save();

    const verificationLink = `http://localhost:3000/auth/verify-email?token=${verificationToken}`;
    sendEmail(
      user.email,
      "Vérification de votre e-mail",
      `Veuillez cliquer sur ce lien pour vérifier votre e-mail : ${verificationLink}`
    );

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Vérification de l'email
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.redirect("http://localhost:5173/login");
  } catch (error) {
    return res.redirect("http://localhost:5173/error?message=invalid-token");
  }
};

// Connexion d'un utilisateur
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Identifiants invalides" });

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Veuillez vérifier votre email avant de vous connecter.",
      });
    }

    const validRoles = ["admin", "chercheur", "technicien"];
    if (!validRoles.includes(user.role)) {
      return res
        .status(400)
        .json({ message: "Rôle d'utilisateur non reconnu" });
    }

    const userData = {
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution,
      specialty: user.specialty,
    };

    // Gestion de l'OTP
    if (!user.otp || user.otpExpires < Date.now()) {
      const lastOTPSentAt = user.lastOTPSentAt;
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (lastOTPSentAt && lastOTPSentAt > oneWeekAgo) {
        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "2h" }
        );
        return res.json({ token, user: userData });
      } else {
        // Générer et sauvegarder un nouvel OTP
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 3 * 60 * 1000;
        user.lastOTPSentAt = Date.now();
        await user.save();

        sendEmail(user.email, "Your OTP", `Your OTP is ${otp}`);
        return res.json({ message: "OTP sent to email" });
      }
    } else {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );
      return res.json({ token, user: userData });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// la verification d'un OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifiez si l'OTP est valide et s'il n'a pas expiré
    if (!user.otp || !user.otpExpires) {
      return res
        .status(400)
        .json({ message: "Aucun OTP en attente de vérification" });
    }

    if (user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP expiré. Veuillez en demander un nouveau" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Code OTP invalide" });
    }

    // OTP valide + nettoyer les champs OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution,
      specialty: user.specialty,
    };

    return res.json({
      message: "OTP vérifié avec succès",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res
      .status(500)
      .json({ message: "Erreur lors de la vérification de l'OTP" });
  }
};

// Renvoi d'un OTP
exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si un OTP existe déjà
    if (user.otp && user.otpExpires && user.otpExpires > Date.now()) {
      return res.status(400).json({
        message:
          "Un OTP valide existe déjà. Veuillez attendre avant d'en demander un nouveau",
      });
    }

    // Générer et sauvegarder un nouveau OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 3 * 60 * 1000;
    await user.save();

    // Envoyer l'email avec l'OTP
    await sendEmail(
      user.email,
      "Votre nouveau code OTP",
      `Votre nouveau code OTP est : ${otp}. Il expirera dans 3 minutes.`
    );

    return res.json({ message: "Nouveau code OTP envoyé avec succès" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res
      .status(500)
      .json({ message: "Erreur lors de l'envoi du nouveau OTP" });
  }
};

// renvoyer un lien de réinitialisation de mot de passe
exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });

  user.verificationToken = verificationToken;
  await user.save();

  const resetLink = `http://localhost:5173/reset-password?token=${verificationToken}`;
  sendEmail(
    user.email,
    "Réinitialisation de votre mot de passe",
    `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`
  );

  res.json({ message: "Email sent for password reset" });
};

// réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.verificationToken !== token) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Mettre à jour le mot de passe
    user.password = await bcrypt.hash(newPassword, 10);
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid token" });
  }
};
