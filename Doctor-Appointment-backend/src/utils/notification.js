// const admin = require("../config/firebaseConfig");
const { Notification } = require("../models");

const sendNotification = async (user, data) => {
    const newNotification = new Notification({
      userId: user._id,
      title: data.title || "",
      content: data.content || "",
      icon: data.icon || "",
      role: data.role || "",
      type: data.type || "notification",
      conversationId: data.conversationId || null,
      appointmentId: data.appointmentId || null,
      transactionId: data.transactionId || null,
      image: data.image || "", 
      sendBy: data.sendBy || null,
      status: "unread",
      devStatus: data.devStatus || "",
      priority: data.priority || "medium",
    });

    await newNotification.save();

    console.log(
      "Successfully sent notification and saved to database:"
    );

}

module.exports = sendNotification;