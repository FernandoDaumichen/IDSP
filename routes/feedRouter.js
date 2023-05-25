const express = require("express");
const router = express.Router();
const {
  createNewBucket,
  updateMessage,
  completeBucketlist,
  deleteMessage,
  getAllMessages,
  deleteBucketlist,
  showBuckets,
  getAllTags,
  addTask,
  getMessageByMessageId,
  updateTask,
  likeMessage,
  getBucketByBucketId,
  UnlikeMessage,
  showBucketforMilestone,
} = require("../database");

const { ensureAuthenticated } = require("../middleware");

//MIDDLEWARE TO ENSURE AUTHENTICATED REQUESTS
router.use(ensureAuthenticated);

//LIKE OR UNLIKE MESSAGE
router.post("/likeMessage", async (req, res) => {
  try {
    const user_id = Number(req.user.id);
    const { status, messageId } = req.body;
    console.log(status,messageId)

    if (status === "like") {
      await likeMessage(user_id, Number(messageId));
    } else if (status === "unlike") {
      await UnlikeMessage(user_id, Number(messageId));
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ message: "error" });
  }
});

//ROUTE TO GET A SPECIFIC BUCKET BY BUCKETID
router.post("/getBucket", async (req, res) => {
  try {
    const { bucketId } = req.body;
    const bucket = await getBucketByBucketId(parseInt(bucketId));
    res.status(200).json({ success: true, bucket });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

//ROUTE TO GET A NEW TASK TO A BUCKET
router.post("/addTask", async (req, res) => {
  try {
    const { newTask, bucketId } = req.body;
    const task = await addTask(newTask, parseInt(bucketId));
    res.status(200).json({ success: true, taskId: task.id  });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

//ROUTE TO GET TASKS FOR A SPECIFIC BUCKET
router.post("/getTask", async (req, res) => {
  try {
    const { bucketId } = req.body;
    const bucket = await showBucketforMilestone(parseInt(bucketId));
    const tasks = bucket.Task;
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

//ROUTE TO DELETE A MESSAGE
router.post("/deleteMessage", async (req, res) => {
  try {
    const id = req.body.messageId;
    await deleteMessage(parseInt(id));
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "An error occurred while deleting the message."});
  }
});

//ROUTE TO UPDATE A MESSAGE
router.post("/updateMessage/:messageId", async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const { newMessage } = req.body;
    await updateMessage(parseInt(messageId), newMessage);
    res.redirect("/feeds/home");
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

//ROUTE TO EDIT A MESSAGE
router.get("/editMessage/:messageId", async (req, res) => {
  try {
    const id = req.params.messageId;
    const message = await getMessageByMessageId(parseInt(id));
    const bucketTitle = (await getBucketByBucketId(message.bucketId)).title
    const user_id = req.user.id;
    res.render("editMessage", { id, user_id, message, bucketTitle });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });    
  }  
});

//DISPLAY MAINFEED
router.get("/home", async (req, res) => {
  try {
    const user_id = req.user.id;
    const feed = await getAllMessages(user_id);
    res.render("mainfeed", { feed, user_id });
  } catch (error) {
    console.log(error);
    res.json({ message: "error" });
  }
});



//CREATE A NEW BUCKET
router.get("/createBucket", async (req, res) => {
  try {
    const user_id = req.user.id;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
    const day = ("0" + currentDate.getDate()).slice(-2);
    const today = `${year}-${month}-${day}`;
    const tags = await getAllTags();
    res.render("createBucket", { today, tags, user_id });
  } catch (error) {
    console.log(error);
    res.json({ message: "error" });
  }
});

//CREATE A NEW BUCKET (POST)
router.post("/createBucket", async (req, res) => {
  try {
    const userId = req.user.id;
    const { dueDate, newBucketInput, tag } = req.body;
    const tagId = parseInt(tag);
    const NewBucketList = await createNewBucket(
      dueDate,
      newBucketInput,
      userId,
      tagId
    );

    if (NewBucketList) {
      res.redirect("/feeds/buckets?show=inprogress");
    } else {
      res.redirect("/feeds/createBucket");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

//CREATE A NEW TASK
router.post("/createTask", async (req, res) => {
  try {
    const { task } = req.body;
    if (task.length > 0) {
      await Promise.all(
        task.map(async (ele) => {
          await addTask(ele);
        })
      );
    }
    res.redirect("/feeds/createMessage");
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

//DISPLAY BUCKETS
router.get("/buckets", async (req, res) => {
  try {
    const { show } = req.query;
    const currentUserId = req.user.id;
    const buckets = await showBuckets(show, currentUserId);
    res.render("showBuckets", { buckets, user_id: currentUserId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

//COMPLETE A BUCKET
router.post("/completeBuckets", async (req, res) => {
  try {
    const { bucket_id } = req.body;
    const bucketId = Number(bucket_id);
    await completeBucketlist(bucketId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

//DELETE A BUCKET
router.post("/deleteBucket", async (req, res) => {
  try {
    const { bucket_id } = req.body;
    const bucketId = Number(bucket_id);
    await deleteBucketlist(bucketId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

//UPDATE TASK COMPLETION 
router.post("/updateTask", async (req, res) => {
  try {
    const { taskId, completed } = req.body;
    const task_id = parseInt(taskId);
    await updateTask(completed, task_id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

//CREATE A NEW MESSAGE
router.get("/createMessage", async (req, res) => {
  try {
    const bucketTitle = req.query.bucket;
    const user_id = req.user.id;
    res.render("createMessage", { user_id, bucketTitle });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

//DISPLAY A BUCKET WITH MILESTONE TASKS
router.get("/bucket/:id", async (req, res) => {
  try {
    let numOfCompleted = 0;
    const bucket = await showBucketforMilestone(parseInt(req.params.id));
    const startdate = new Date(bucket.startDate);
    const duedate = new Date(bucket.dueDate);
    const formattedStartDate = startdate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const formattedDueDate = duedate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    bucket.startDate = formattedStartDate;
    bucket.dueDate = formattedDueDate;

    bucket.Task.forEach((task) => {
      if (task.completed) {
        numOfCompleted++;
      }
    });

    res.render("showBucket", { bucket, numOfCompleted });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

//COMPLETE A BUCKET
router.post("/bucket/:id", async (req, res) => {
  try {
    const { bucket_id } = req.body;
    const bucketId = Number(bucket_id);
    await completeBucketlist(bucketId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
