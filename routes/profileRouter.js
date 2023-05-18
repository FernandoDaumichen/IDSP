const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const {
  getBucketTitleByMessageId,
  changeUsername,
  addNewMessage,
  showBuckets,
  getUserByUserId,
  getAllMessageOfOneUser,
  getAllComments,
  getMessagesByMessageId,
  commentMessage,
  getUserIdByBucketId,
  getUserFollowing,
  addFriend,
  removeFriend,
} = require("../database");

const { ensureAuthenticated } = require("../middleware");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(ensureAuthenticated);

router.post("/friendUnfriend", async (req, res) => {
  try {
    const { friendshipValue, friend_id } = req.body;
    const friendid = Number(friend_id);
    const user_id = req.user.id;
    if (friendshipValue === "Add Friend") {
      await addFriend(user_id, friendid);
      res.status(200).json({ success: true, message: "friended" });
    } else {
      await removeFriend(user_id, friendid);
      res.status(200).json({ success: true, message: "unfriended" });

    }
  } catch (error) {
    console.log(error);
    res.json({ message: "error" });
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    const loginUserId = Number(req.user.id);
    const userId = Number(req.params.user_id);

    const [data, user, userFollowing, totalBucketTitle] = await Promise.all([
      getAllMessageOfOneUser(userId),
      getUserByUserId(userId),
      getUserFollowing(loginUserId),
      showBuckets("all", userId),
    ]);

    const userFollowingId = userFollowing.following
      .flat()
      .map((user) => user.id);

    res.render("profile", {
      loginUserId,
      data,
      userId,
      user,
      totalBucketTitle,
      userFollowingId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

router.post("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { bucket_id, newMessage } = req.body;
    if (bucket_id) {
      await addNewMessage(newMessage, bucket_id);
    }
    res.redirect(`/profile/${user_id}`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

router.get("/edit/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user_id = Number(userId);
    const userInfo = await getUserByUserId(user_id);
    res.render("editProfile", { data: userInfo });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

router.post("/edit/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user_id = Number(userId);
    const { newUsername } = req.body;
    await changeUsername(user_id, newUsername);
    res.redirect(`/profile/${user_id}`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

router.get("/settings", (req, res) => {
  try {
    const user_id = req.user.id;
    const data = getUserFeed(user_id);
    res.render("settings", { data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

router.get("/comment/:messageId", async (req, res) => {
  try {
    const message_id = Number(req.params.messageId);
    const comments = await getAllComments(message_id);
    const message = await getMessagesByMessageId(message_id);
    const bucketTitle = await getBucketTitleByMessageId(message_id);
    const message_bucket_id = message.bucketId;
    const message_creator_id = await getUserIdByBucketId(message_bucket_id);
    const inputData = message_creator_id.userId;
    const message_creator_info = await getUserByUserId(inputData);

    const modifiedMessage = {
      message_id: message.id,
      message_content: message.content,
      message_bucketid: message.bucketId,
      message_createdAt: message.createdAt,
      message_userInfo: message_creator_info,
    };

    const modifiedComments = await Promise.all(
      comments.map(async (comment) => {
        const commentor = await getUserByUserId(comment.userId);
        const commentorName = commentor.username;
        const commentorProfile = commentor.profileImg;
        return {
          id: comment.id,
          comment: comment.content,
          messageId: comment.messageId,
          username: commentorName,
          userProfile: commentorProfile,
          createdAt: comment.createdAt,
        };
      })
    );

    res.render("comment", {
      comments: modifiedComments,
      message: modifiedMessage,
      bucketTitle,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

router.post("/comment/:messageId", async (req, res) => {
  try {
    const user_id = req.user.id;
    const { messageId } = req.params;
    const { newComment } = req.body;
    await commentMessage(newComment, Number(messageId), user_id);
    res.redirect(`/profile/comment/${messageId}`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});



module.exports = router;
