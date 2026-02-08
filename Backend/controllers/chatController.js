// controllers/chatController.js
import Chat from "../models/Chat.js";
import Rental from "../models/Rental.js";
import User from "../models/User.js";


//Return all messages for a rental (conversation)
export const getChatByRental = async (req, res) => {
  try {
    const { rentalId } = req.params;

    // validate rental exists (optional but nice)
    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    const messages = await Chat.find({ rentalId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name role")
      .populate("receiverId", "name role");

    return res.json({ success: true, messages });
  } catch (err) {
    console.error("GET CHAT ERROR:", err);
    return res
      .status(500)
      .json({ message: "Failed to load chat", error: err.message });
  }
};

//POST /api/chat/send
export const sendMessage = async (req, res) => {
  try {
    const { rentalId, senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId) {
      console.log("❌ Chat error: Missing sender or receiver");
      return res.status(400).json({ message: "Missing user IDs" });
    }

    const chat = await Chat.create({
      rentalId,
      senderId,
      receiverId,
      message,
    });

    res.json(chat);
  } catch (err) {
    console.error("SEND CHAT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


//payload should contain: { rentalId, senderId, receiverId, message }

export const saveMessage = async (payload) => {
  const {
    rentalId,
    senderId,
    receiverId,
    from,
    to,
    text,
    message,
  } = payload;

  const sId = senderId || from;
  const rId = receiverId || to;
  const msgText = message || text;

  if (!rentalId || !sId || !rId || !msgText) {
    throw new Error("Missing required fields in socket payload");
  }

  const chat = new Chat({
    rentalId,
    senderId: sId,
    receiverId: rId,
    message: msgText,
    seenBy: [sId],
  });

  await chat.save();

  const populated = await chat
    .populate("senderId", "name role")
    .populate("receiverId", "name role");

  return populated;
};

// POST /api/chat/:rentalId/seen
 
export const markSeen = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    await Chat.updateMany(
      { rentalId, seenBy: { $ne: userId } },
      { $addToSet: { seenBy: userId } }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("MARK SEEN ERROR:", err);
    return res
      .status(500)
      .json({ message: "Failed to mark seen", error: err.message });
  }
};

export default {
  getChatByRental,
  sendMessage,
  saveMessage,
  markSeen,
};
