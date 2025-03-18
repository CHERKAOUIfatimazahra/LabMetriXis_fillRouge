import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaLock,
  FaRocket,
  FaSearchPlus,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaRegLightbulb,
} from "react-icons/fa";
import axios from "axios";

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    message: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const responce = axios.post(
        `${import.meta.env.VITE_API_URL}/contactus/contactus`,
        formData
      );
      console.log(responce);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Testimonial auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const features = [
    {
      icon: <FaChartLine className="w-8 h-8 text-teal-500" />,
      title: "Sample Management",
      description: "Advanced tracking and management of laboratory samples",
      details:
        "Comprehensive sample tracking with real-time updates and detailed analytics.",
    },
    {
      icon: <FaClipboardList className="w-8 h-8 text-teal-500" />,
      title: "Project Tracking",
      description: "Comprehensive project workflow and resource management",
      details:
        "Streamline project progress, allocate resources, and monitor milestones effectively.",
    },
    {
      icon: <FaUsers className="w-8 h-8 text-teal-500" />,
      title: "Collaborative Research",
      description: "Seamless team collaboration and knowledge sharing",
      details:
        "Connect researchers, share insights, and accelerate scientific discoveries.",
    },
  ];

  const benefits = [
    {
      icon: <FaRegLightbulb className="w-12 h-12 text-teal-500" />,
      title: "Increased Efficiency",
      description:
        "Reduce research time by 40% with optimized workflows and automated data management.",
    },
    {
      icon: <FaLock className="w-12 h-12 text-teal-500" />,
      title: "Data Security",
      description:
        "Enterprise-grade security protocols to protect your valuable research data.",
    },
    {
      icon: <FaRocket className="w-12 h-12 text-teal-500" />,
      title: "Accelerated Results",
      description:
        "Get to breakthrough discoveries faster with streamlined research processes.",
    },
    {
      icon: <FaSearchPlus className="w-12 h-12 text-teal-500" />,
      title: "Enhanced Insights",
      description:
        "Advanced analytics provide deeper understanding of your research data.",
    },
  ];

  const testimonials = [
    {
      quote:
        "LabMetriXis transformed our research department's efficiency. We've reduced administrative tasks by 60% and accelerated our publication rate.",
      author: "Dr. Emily Chen",
      role: "Research Director",
      organization: "Global Science Institute",
      image: "scientist-09-16011_450.jpg",
    },
    {
      quote:
        "The sample tracking capabilities alone have saved us countless hours. Our cross-departmental collaboration has never been stronger.",
      author: "Prof. Michael Rodriguez",
      role: "Lead Researcher",
      organization: "Northwestern University",
      image: "Women-in-science-1044228354-675.jpg",
    },
    {
      quote:
        "Implementing LabMetriXis was the best decision we made last year. The ROI has been remarkable in terms of research output and quality.",
      author: "Sarah Williams, PhD",
      role: "Laboratory Manager",
      organization: "BioTech Innovations",
      image: "c46d5052ee9d71ad2d945aab8a4786c5.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-teal-700 bg-opacity-90 backdrop-blur-lg shadow-md py-3"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            {/* <img
              src="/logo.png"
              alt="LabMetriXis Logo"
              className="h-10 w-auto mr-3"
            /> */}
            <span className="text-2xl font-bold text-white">LabMetriXis</span>
          </div>
          <div className="hidden md:flex space-x-6 items-center">
            <a
              href="#features"
              className="text-white hover:text-teal-200 transition-colors"
            >
              Features
            </a>
            <a
              href="#benefits"
              className="text-white hover:text-teal-200 transition-colors"
            >
              Benefits
            </a>
            <a
              href="#testimonials"
              className="text-white hover:text-teal-200 transition-colors"
            >
              Testimonials
            </a>
            <a
              href="#about"
              className="text-white hover:text-teal-200 transition-colors"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-white hover:text-teal-200 transition-colors"
            >
              Contact
            </a>
            <Link
              to="/login"
              className="px-4 py-2 bg-white text-teal-700 rounded-lg hover:bg-teal-50 transition-all"
            >
              Login
            </Link>
          </div>
          <button className="md:hidden text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative min-h-screen flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700 to-teal-900 opacity-90">
          {/* Background image overlay */}
          <img
            src="10122-cover-recursion.jpg"
            alt="Laboratory Background"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl md:w-1/2 text-center md:text-left mb-12 md:mb-0"
          >
            <h1 className="text-5xl font-bold text-white mb-6">
              Revolutionize Your Research Management
            </h1>
            <p className="text-xl text-teal-100 mb-10 leading-relaxed">
              LabMetriXis transforms scientific research with intelligent sample
              tracking, collaborative project management, and advanced
              analytics.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="block w-full sm:w-auto px-8 py-3 bg-white text-teal-700 rounded-lg hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
                >
                  Get Started
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/demo"
                  className="block w-full sm:w-auto px-8 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-teal-700 transition-all text-center"
                >
                  Request Demo
                </Link>
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="md:w-1/2 flex justify-center"
          >
            <img
              src="360_F_240748870.jpg"
              alt="LabMetriXis Dashboard"
              className="max-w-full rounded-lg shadow-2xl"
            />
          </motion.div>
        </div>
      </motion.header>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-white py-16"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <h3 className="text-4xl font-bold text-teal-600 mb-2">200+</h3>
              <p className="text-gray-600">Research Institutions</p>
            </div>
            <div className="p-6">
              <h3 className="text-4xl font-bold text-teal-600 mb-2">10K+</h3>
              <p className="text-gray-600">Active Researchers</p>
            </div>
            <div className="p-6">
              <h3 className="text-4xl font-bold text-teal-600 mb-2">15M+</h3>
              <p className="text-gray-600">Samples Tracked</p>
            </div>
            <div className="p-6">
              <h3 className="text-4xl font-bold text-teal-600 mb-2">40%</h3>
              <p className="text-gray-600">Efficiency Increase</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        id="features"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-teal-800">
            Powerful Features for Modern Research
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Our comprehensive suite of tools helps researchers focus on what
            matters most: scientific discovery.
          </p>
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.3 },
                }}
                onClick={() =>
                  setActiveFeature(activeFeature === index ? null : index)
                }
                className={`bg-white rounded-lg shadow-xl p-8 border-t-4 border-teal-500 hover:shadow-2xl transition-all cursor-pointer group relative ${
                  activeFeature === index ? "ring-4 ring-teal-300" : ""
                }`}
              >
                <div className="mb-6 flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full group-hover:bg-teal-200 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-teal-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>

                {activeFeature === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-teal-50 p-6 rounded-lg overflow-hidden"
                  >
                    <p className="text-teal-800">{feature.details}</p>
                    <div className="mt-4 flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-colors"
                      >
                        Learn More
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Solution Showcase */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2 mb-10 md:mb-0 md:pr-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-teal-800">
                Sample Management Made Simple
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Our intuitive sample tracking system lets you monitor every
                sample from collection to storage, with comprehensive data
                capture at each stage.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-teal-100 p-1 rounded-full mr-3 mt-1">
                    <svg
                      className="w-4 h-4 text-teal-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    QR code and barcode integration
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-teal-100 p-1 rounded-full mr-3 mt-1">
                    <svg
                      className="w-4 h-4 text-teal-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    Full chain of custody tracking
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-teal-100 p-1 rounded-full mr-3 mt-1">
                    <svg
                      className="w-4 h-4 text-teal-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    Environmental condition monitoring
                  </span>
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  to="/feature/sample-tracking"
                  className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium"
                >
                  Learn more about sample tracking
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:w-1/2"
            >
              <img
                src="istockphoto.jpg"
                alt="Sample Tracking System"
                className="rounded-lg shadow-xl max-w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        id="benefits"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 bg-teal-50"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-teal-800">
            Why Choose LabMetriXis?
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Join leading research institutions that have transformed their
            workflow efficiency and research output.
          </p>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="bg-white rounded-lg shadow-lg p-8 text-center"
              >
                <div className="mb-6 mx-auto flex items-center justify-center w-20 h-20 bg-teal-100 rounded-full">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-teal-800">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        id="testimonials"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-teal-800">
            Trusted by Leading Researchers
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Hear what our customers have to say about their experience with
            LabMetriXis.
          </p>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${activeTestimonial * 100}%)`,
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="min-w-full px-4">
                    <div className="bg-teal-50 rounded-xl p-8 shadow-lg">
                      <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
                          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                            <img
                              src={testimonial.image}
                              alt={testimonial.author}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/api/placeholder/128/128";
                              }}
                            />
                          </div>
                        </div>
                        <div className="md:w-2/3 md:pl-8">
                          <div className="text-teal-700 mb-4">
                            <svg
                              className="w-8 h-8 opacity-50"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>
                          </div>
                          <p className="text-lg text-gray-700 italic mb-6">
                            {testimonial.quote}
                          </p>
                          <div>
                            <h4 className="font-bold text-teal-800">
                              {testimonial.author}
                            </h4>
                            <p className="text-gray-600">{testimonial.role}</p>
                            <p className="text-gray-500">
                              {testimonial.organization}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    activeTestimonial === index ? "bg-teal-500" : "bg-teal-200"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        id="about"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-20 bg-teal-800 text-white"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:w-1/2 mb-12 lg:mb-0"
            >
              <img
                src="shutterstock.jpg"
                alt="Our Team"
                className="rounded-lg shadow-2xl max-w-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/600/400";
                }}
              />
            </motion.div>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:w-1/2 lg:pl-16"
            >
              <h2 className="text-4xl font-bold mb-6">About LabMetriXis</h2>
              <p className="text-teal-100 mb-6 text-lg">
                Founded by scientists for scientists, LabMetriXis was born from
                the frustration of managing complex research without proper
                tools. Our team combines expertise in scientific research and
                software development.
              </p>
              <p className="text-teal-100 mb-8 text-lg">
                Our mission is to accelerate scientific discovery by providing
                researchers with the tools they need to focus on what matters
                most - their research, not administrative tasks.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-xl mb-3">Our Vision</h4>
                  <p className="text-teal-100">
                    To transform how research is conducted globally, making it
                    more efficient, collaborative and transparent.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-xl mb-3">Our Values</h4>
                  <p className="text-teal-100">
                    Integrity, innovation, collaboration, and a relentless
                    commitment to scientific advancement.
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  to="/about"
                  className="inline-block px-6 py-3 bg-white text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  Learn More About Us
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Clients/Partners Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-16 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-teal-800">
            Trusted by Industry Leaders
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-center">
                <img
                  src={`MITEM.jpg`}
                  alt={`Partner ${i + 1}`}
                  className="h-16 object-contain grayscale hover:grayscale-0 transition-all"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/160/80";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Us Section */}
      <motion.section
        id="contact"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-teal-800">
            Ready to Transform Your Research?
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Reach out to our team for a personalized demonstration or to learn
            more about how LabMetriXis can help your organization.
          </p>
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 lg:pr-16 mb-10 lg:mb-0">
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-xl p-8 border border-gray-200"
              >
                <div className="mb-6">
                  <label
                    htmlFor="name"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="organization"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Organization
                  </label>
                  <input
                    type="text"
                    id="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    placeholder="Your Research Institution"
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Send Message
                </motion.button>
              </motion.form>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:w-1/2 lg:pl-8"
            >
              <div className="bg-teal-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-teal-800">
                  Contact Information
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-teal-100 rounded-full p-3 mr-4">
                      <FaMapMarkerAlt className="text-teal-600 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-teal-800 mb-1">
                        Our Location
                      </h4>
                      <p className="text-gray-600">
                        123 Innovation Drive, Techville, CA 94043, United States
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-teal-100 rounded-full p-3 mr-4">
                      <FaPhone className="text-teal-600 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-teal-800 mb-1">
                        Phone Number
                      </h4>
                      <p className="text-gray-600">+1 (888) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-teal-100 rounded-full p-3 mr-4">
                      <FaEnvelope className="text-teal-600 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-teal-800 mb-1">
                        Email Address
                      </h4>
                      <p className="text-gray-600">info@labmetrixis.com</p>
                    </div>
                  </div>
                </div>
                <div className="mt-10">
                  <h3 className="text-2xl font-bold mb-6 text-teal-800">
                    Office Hours
                  </h3>
                  <div className="bg-white rounded-lg p-5 shadow-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-teal-800 mb-1">
                          Monday - Friday
                        </h4>
                        <p className="text-gray-600">9:00 AM - 6:00 PM</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-teal-800 mb-1">
                          Saturday
                        </h4>
                        <p className="text-gray-600">10:00 AM - 2:00 PM</p>
                      </div>
                      <div className="col-span-2">
                        <h4 className="font-semibold text-teal-800 mb-1">
                          Sunday
                        </h4>
                        <p className="text-gray-600">Closed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-20 bg-gradient-to-r from-teal-600 to-teal-800 text-white"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Elevate Your Research?
          </h2>
          <p className="text-xl text-teal-100 mb-10 max-w-3xl mx-auto">
            Join hundreds of leading research institutions already benefiting
            from LabMetriXis's powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="block w-full sm:w-auto px-8 py-4 bg-white text-teal-700 rounded-lg hover:bg-teal-50 transition-all font-bold text-lg"
              >
                Start Free Trial
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/demo"
                className="block w-full sm:w-auto px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-teal-700 transition-all font-bold text-lg"
              >
                Schedule Demo
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <img
                  src="/logo-white.png"
                  alt="LabMetriXis Logo"
                  className="h-10 w-auto mr-3"
                />
                <span className="text-2xl font-bold">LabMetriXis</span>
              </div>
              <p className="text-gray-400 mb-6">
                Revolutionizing how research institutions manage samples,
                projects, and collaboration.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/features"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pricing"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Resources</h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/documentation"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    to="/api"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tutorials"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Support Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Newsletter</h3>
              <p className="text-gray-400 mb-4">
                Subscribe to our newsletter for the latest updates and insights.
              </p>
              <form className="mb-4">
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="px-4 py-2 w-full rounded-l-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    className="bg-teal-600 text-white px-4 py-2 rounded-r-lg hover:bg-teal-700 transition-colors"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
              <p className="text-gray-500 text-sm">
                By subscribing, you agree to our Privacy Policy and consent to
                receive updates from our company.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} LabMetriXis. All rights
                reserved.
              </p>
              <div className="flex space-x-6">
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/cookies"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
