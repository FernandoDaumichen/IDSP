const express = require("express");
const multer  = require('multer');
const path = require("path");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bucketed',
    format: async (req, file) => 'png', // supports promises as well
    public_id: (req, file) => Date.now() + path.extname(file.originalname),
  },
});

const upload = multer({ storage: storage });
const router = express.Router();
const bodyParser = require("body-parser");
const {
  deleteProfilePhoto,
  getBucketTitleByMessageId,
  changeUsername,
  addNewMessage,
  showBuckets,
  getUserByUserId,
  getAllMessageOfOneUser,
  getAllComments,
  getMessageByMessageId,
  commentMessage,
  getUserIdByBucketId,
  getUserFollowing,
  addFriend,
  removeFriend,
  addNewPhotoMessage,
  changeProfilePhoto,
} = require("../database");

const { ensureAuthenticated } = require("../middleware");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(ensureAuthenticated);

//Upload Media+Message after completing bucketlist
router.post('/uploadMedia/:bucketid', upload.single('completionPhoto'), async function (req, res) {
  const { newMessage } = req.body;
  const bucketId = req.params.bucketid;
  const file = req.file;
  const user_id = req.user.id;

  try {
    const cloud = await cloudinary.uploader.upload(file.path);
    await addNewPhotoMessage(newMessage, bucketId, cloud.url);
  } catch (error) {
    console.log(error);
  }

  res.redirect(`/profile/${user_id}`);
});

router.post('/deleteProfilePhoto', async (req, res)=>{
  try {
    const user_id = req.user.id;
    const updatedUser = await deleteProfilePhoto(parseInt(user_id));
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
})


//UPLOAD MESSAGE ONLY WHEN COMPLETE BUCKETLIST
router.post('/uploadMessageOnly/:bucketid', async function (req, res) {
  const { newMessage } = req.body;
  const bucketId = req.params.bucketid;
  const user_id = req.user.id;

  try {
    await addNewMessage(newMessage, bucketId);
  } catch (error) {
    console.log(error);
  }

  res.redirect(`/profile/${user_id}`);
});

//FOLLOWING OR UNFOLLOWING
router.post("/friendUnfriend", async (req, res) => {
  try {
    const { friendshipValue, friend_id } = req.body;
    const user_id = req.user.id;
    if (friendshipValue === "Add Friend") {
      await addFriend(user_id, Number(friend_id));
      res.status(200).json({ success: true, message: "friended" });
    } else {
      await removeFriend(user_id, Number(friend_id));
      res.status(200).json({ success: true, message: "unfriended" });
    }
  } catch (error) {
    console.log(error);
    res.json({ message: "error" });
  }
});

//POST MESSAGE -- CLEANING UP IN PROGRESS
router.get("/postMessage/:bucketId", async (req, res) => {
  const userId = Number(req.user.id);
  const bucketId = req.params.bucketId;
  const user = await getUserByUserId(userId);
  res.render("postMessage", { user, userId, bucketId });
})

router.get("/postMessageOnly/:bucketId", async (req, res) => {
  const userId = Number(req.user.id);
  const bucketId = req.params.bucketId;
  const user = await getUserByUserId(userId);
  res.render("postMessageOnly", { user, userId, bucketId });
})

router.get("/:user_id", async (req, res) => {
  try {
    const { show } = req.query; // media | posts
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
      show,
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


//Update Profile Photo
router.post('/updateProfilePhoto/:userid', upload.single('newProfilePhoto'), async function (req, res) {
  const file = req.file;
  const user_id = req.params.userid;
  const { newUsername } = req.body;

  if(newUsername && !file) {
    await changeUsername(parseInt(user_id), newUsername);
    res.redirect(`/profile/${user_id}`);
  } else if(newUsername && file){
    await changeUsername(user_id, newUsername);
    const cloud = await cloudinary.uploader.upload(file.path);
    await changeProfilePhoto(parseInt(user_id), file.path);
    res.redirect(`/profile/${user_id}`);
  } else if(!newUsername && file){
    const cloud = await cloudinary.uploader.upload(file.path);
    await changeProfilePhoto(parseInt(user_id), file.path);
    res.redirect(`/profile/${user_id}`);
  } else {
    res.redirect(`/profile/${user_id}`);
  }
  try {
  } catch (error) {
    console.log(error);
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

router.get("/settings/:userId", async (req, res) => {
  try {
    const user_id = Number(req.params.userId);
    const data = await getUserByUserId(user_id);
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
    const message = await getMessageByMessageId(message_id);

    const user_id = parseInt(req.user.id);

    const bucketTitle = await getBucketTitleByMessageId(message_id);
    const message_bucket_id = message.bucketId;
    const message_creator_id = await getUserIdByBucketId(message_bucket_id);
    const inputData = message_creator_id.userId;
    const message_creator_info = await getUserByUserId(inputData);

    const modifiedMessage = {
      id: message.id,
      content: message.content,
      bucketid: message.bucketId,
      createdAt: message.createdAt,
      userInfo: message_creator_info,
      photo: message.photo,
      likes: message.likes
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
          likes: comment.likes,
          createdAt: comment.createdAt,
        };
      })
    );


    res.render("comment", {
      comments: modifiedComments,
      message: modifiedMessage,
      bucketTitle,
      user_id
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