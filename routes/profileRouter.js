const express = require("express");
const router = express.Router();
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
} = require("../database");
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: false }));

const { ensureAuthenticated } = require("../middleware");
const { getUserIdByBucketId } = require('../database');
router.use(ensureAuthenticated);

router.get("/:user_id", async (req, res) => {
  const St_loginuser_id = req.user.id;
  const loginuser_id = Number(St_loginuser_id);
  const St_userId = req.params.user_id;
  const user_id = Number(St_userId);
  const data = await getAllMessageOfOneUser(user_id);
  // console.log(data);
  const user = await getUserByUserId(user_id);
  const totalBucketTitle = await showBuckets("all", user_id);
  res.render("profile", { loginuser_id, data, user_id, user, totalBucketTitle });
});

router.post("/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const { bucket_id, newMessage } = req.body;
    await addNewMessage(newMessage, bucket_id);
    res.redirect(`/profile/${user_id}`);
  } catch (error) {
    console.log(error);
  }

});

router.get("/edit/:userId", async (req, res) => {
  const userId = req.params.userId;
  const user_id = Number(userId);
  const userInfo = await getUserByUserId(user_id);
  res.render("editProfile", { data: userInfo });
});

router.post("/edit/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user_id = Number(userId);
    const {newUsername} = req.body;
    await changeUsername(user_id, newUsername);
    res.redirect(`/profile/${user_id}`);
  } catch (error) {
    console.log(error);
  }


});

router.get("/settings", (req, res) => {
  const user_id = req.user.id;
  const data = getUserFeed(user_id);
  res.render("settings", { data });
});

router.get("/comment/:messageId", async ( req, res ) => {
  const Str_message_id = req.params.messageId;
  const message_id = Number(Str_message_id);
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

  const modifiedComments = await Promise.all(comments.map(async (comment) =>  { 
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
  }}));
  res.render("comment", {comments: modifiedComments, message: modifiedMessage, bucketTitle});
});

router.post("/comment/:messageId", async ( req, res ) => {
  const user_id = req.user.id;
  const message_id = req.params.messageId;
  const messageId = Number(message_id);
  const {newComment} = req.body;
  const comment = await commentMessage(newComment, messageId, user_id);
  res.redirect(`/profile/comment/${message_id}`);
})


module.exports = router;
