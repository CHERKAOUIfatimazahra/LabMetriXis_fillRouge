const request = require("supertest");
const express = require("express");
const notificationController = require("../controllers/NotificationsController");
const Notification = require("../models/Notification");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    id: "123",
    _id: "123",
  };
  next();
});

app.get("/notification", notificationController.getNotifications);
app.get("/notification/count", notificationController.getUnreadCount);
app.put("/notification/:id/read", notificationController.markAsRead);
app.put("/notification/read-all", notificationController.markAllAsRead);

jest.mock("../models/Notification");

describe("Notification Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /notification", () => {
    it("should return all notifications for the user", async () => {
      const mockNotifications = [
        { _id: "1", user: "123", message: "Notification 1", isRead: false },
        { _id: "2", user: "123", message: "Notification 2", isRead: true },
      ];

      const mockSort = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockPopulate1 = jest.fn().mockReturnThis();
      const mockPopulate2 = jest.fn().mockResolvedValue(mockNotifications);

      Notification.find = jest.fn(() => ({
        sort: mockSort,
        limit: mockLimit,
        populate: mockPopulate1,
      }));

      mockPopulate1.mockReturnValue({
        populate: mockPopulate2,
      });

      const res = await request(app).get("/notification");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockNotifications);
      expect(Notification.find).toHaveBeenCalledWith({ user: "123" });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockLimit).toHaveBeenCalledWith(50);
      expect(mockPopulate1).toHaveBeenCalledWith("relatedProject", "name");
      expect(mockPopulate2).toHaveBeenCalledWith("relatedSample", "name");
    });

    it("should return 500 if there's an error", async () => {
      Notification.find = jest.fn(() => {
        throw new Error("Database error");
      });

      const res = await request(app).get("/notification");

      expect(res.status).toBe(500);
      expect(res.text).toBe("Erreur serveur");
    });
  });

  describe("GET /notification/count", () => {
    it("should return the unread count", async () => {
      Notification.countDocuments = jest.fn().mockResolvedValue(5);

      const res = await request(app).get("/notification/count");

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(5);
      expect(Notification.countDocuments).toHaveBeenCalledWith({
        user: "123",
        isRead: false,
      });
    });

    it("should return 500 if there's an error", async () => {
      Notification.countDocuments = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/notification/count");

      expect(res.status).toBe(500);
      expect(res.text).toBe("Erreur serveur");
    });
  });

  describe("PUT /notification/:id/read", () => {
    it("should mark a notification as read", async () => {
      const mockNotification = {
        _id: "1",
        user: "123",
        message: "Notification 1",
        isRead: false,
        save: jest.fn().mockResolvedValue({
          _id: "1",
          user: "123",
          message: "Notification 1",
          isRead: true,
        }),
      };

      Notification.findOne = jest.fn().mockResolvedValue(mockNotification);

      const res = await request(app).put("/notification/1/read");

      expect(res.status).toBe(200);
      expect(mockNotification.isRead).toBe(true);
      expect(mockNotification.save).toHaveBeenCalled();
      expect(Notification.findOne).toHaveBeenCalledWith({
        _id: "1",
        user: "123",
      });
    });

    it("should return 404 if notification is not found", async () => {
      Notification.findOne = jest.fn().mockResolvedValue(null);

      const res = await request(app).put("/notification/1/read");

      expect(res.status).toBe(404);
      expect(res.body.msg).toBe("Notification non trouvée");
    });

    it("should return 500 if there's an error", async () => {
      Notification.findOne = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).put("/notification/1/read");

      expect(res.status).toBe(500);
      expect(res.text).toBe("Erreur serveur");
    });
  });

  describe("PUT /notification/read-all", () => {
    it("should mark all notifications as read", async () => {
      Notification.updateMany = jest.fn().mockResolvedValue({ nModified: 3 });

      const res = await request(app).put("/notification/read-all");

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe(
        "Toutes les notifications ont été marquées comme lues"
      );
      expect(Notification.updateMany).toHaveBeenCalledWith(
        { user: "123", isRead: false },
        { $set: { isRead: true } }
      );
    });

    it("should return 500 if there's an error", async () => {
      Notification.updateMany = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).put("/notification/read-all");

      expect(res.status).toBe(500);
      expect(res.text).toBe("Erreur serveur");
    });
  });

  describe("createNotification function", () => {
    it("should create a notification successfully", async () => {
      const mockNotification = {
        _id: "new-id",
        user: "123",
        title: "Test Title",
        message: "Test Message",
        type: "Test",
        relatedProject: "project-id",
        relatedSample: null,
        isRead: false,
        save: jest.fn().mockResolvedValue(true),
      };

      Notification.prototype.save = jest
        .fn()
        .mockResolvedValue(mockNotification);
      const originalNotification = jest.fn();
      Notification.mockImplementation(() => mockNotification);

      const result = await notificationController.createNotification(
        "123",
        "Test Message",
        "project-id",
        null,
        "Test",
        "Test Title"
      );

      expect(result).toBe(mockNotification);
      expect(mockNotification.save).toHaveBeenCalled();
    });
  });

  describe("createNotificationForUsers function", () => {
    it("should create notifications for multiple users", async () => {
      const mockNotification1 = { _id: "1", user: "123" };
      const mockNotification2 = { _id: "2", user: "456" };

      const createNotificationSpy = jest.spyOn(
        notificationController,
        "createNotification"
      );
      createNotificationSpy
        .mockResolvedValueOnce(mockNotification1)
        .mockResolvedValueOnce(mockNotification2);

      const result = await notificationController.createNotificationForUsers(
        ["123", "456"],
        "Test Message",
        "project-id"
      );

      expect(result).toEqual([mockNotification1, mockNotification2]);
      expect(createNotificationSpy).toHaveBeenCalledTimes(2);
      createNotificationSpy.mockRestore();
    });

    it("should handle single user ID as non-array", async () => {
      const mockNotification = { _id: "1", user: "123" };

      const createNotificationSpy = jest.spyOn(
        notificationController,
        "createNotification"
      );
      createNotificationSpy.mockResolvedValueOnce(mockNotification);

      const result = await notificationController.createNotificationForUsers(
        "123",
        "Test Message"
      );

      expect(result).toEqual([mockNotification]);
      expect(createNotificationSpy).toHaveBeenCalledTimes(1);
      createNotificationSpy.mockRestore();
    });
  });
});
