const { contactUs } = require("../controllers/contactusController");
const { sendEmail } = require("../utils/mailer");

jest.mock("../utils/mailer", () => ({
  sendEmail: jest.fn(),
}));

require("dotenv").config();

describe("contactUs Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("should return 400 if required fields are missing", async () => {
    req.body = { name: "John Doe", email: "" };

    await contactUs(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields" });
  });

  test("should return 500 if admin email is not configured", async () => {
    delete process.env.EMAIL;

    req.body = {
      name: "John Doe",
      email: "john@example.com",
      message: "Hello",
    };

    await contactUs(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Admin email is not configured",
    });
  });

  test("should send email and return 200 if successful", async () => {
    process.env.EMAIL = "admin@example.com";

    req.body = {
      name: "John Doe",
      email: "john@example.com",
      message: "Hello",
    };

    sendEmail.mockResolvedValueOnce();

    await contactUs(req, res);

    expect(sendEmail).toHaveBeenCalledWith(
      "admin@example.com",
      "New contact form submission from John Doe",
      expect.stringContaining("Message:\n        Hello")
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email sent successfully",
    });
  });

});
