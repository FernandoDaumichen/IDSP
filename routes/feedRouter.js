const express = require("express");
const router = express.Router();
const {
  createNewBucket,
  completeBucketlist,
  getAllMessages,
  deleteBucketlist,
  showBuckets,
  getAllTags,
  addTask,
  updateTask,
  likeMessage,
  getBucketByBucketId,
  UnlikeMessage,
  showBucketforMilestone,
} = require("../database");

const { ensureAuthenticated } = require("../middleware");

router.use(ensureAuthenticated);


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

router.post("/likeMessage", async (req, res) => {
  try {
    const user_id = Number(req.user.id);
    const { status, messageId } = req.body;
    const message_id = Number(messageId);

    if (status === "like") {
      await likeMessage(user_id, message_id);
    } else if (status === "unlike") {
      await UnlikeMessage(user_id, message_id);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ message: "error" });
  }
});

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

router.get("/createTask/:bucketid", async (req, res) => {
  try {
    const bucketId = parseInt(req.params.bucketid);
    res.render("createTask");
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

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

router.get("/buckets", async (req, res) => {
  try {
    const { show } = req.query;
    const currentUserId = req.user.id;
    const buckets = await showBuckets(show, currentUserId);
    // buckets.map(bucket => {
    //   bucket.show = show;
    //   return bucket;
    // })
    res.render("showBuckets", { buckets, user_id: currentUserId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

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
////🐨

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

router.get("/createMessage", async (req, res) => {
  try {
    const bucketTitle = req.query.bucket;
    const user_id = req.user.id;
    const data = await getUserFeed(user_id);
    res.render("createMessage", { data, user_id, bucketTitle });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

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
