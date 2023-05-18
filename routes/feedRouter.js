const express = require("express");
const router = express.Router();
const {
  createNewBucket,
  completeBucketlist,
  getAllMessages,
  deleteBucketlist,
  showBuckets,
  getTasks,
  getAllTags,
  createNewTasks,
  getBucketTitleByBucketId,
  updateTask,
  likeMessage,
  UnlikeMessage,
} = require("../database");

const { ensureAuthenticated } = require("../middleware");

router.use(ensureAuthenticated);

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
    const { dueDate, newBucket, tag } = req.body;
    const tagId = parseInt(tag);
    const NewBucketList = await createNewBucket(
      dueDate,
      newBucket,
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
          await createNewTasks(ele);
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

router.post("/addTask", async (req, res) => {
  try {
    const { task, path } = req.body;
    const newTask = await createNewTasks(task, Number(path));
    res.status(200).json({ success: true, taskId: newTask.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

router.post("/updateTask/:taskId", async (req, res) => {
  try {
    const { completed } = req.body;
    const taskId = req.params.taskId;
    await updateTask(completed, Number(taskId));
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
    const user_id = req.user.id;
    const tasks = await getTasks(parseInt(req.params.id));
    const bucketTitle = await getBucketTitleByBucketId(parseInt(req.params.id));
    let numOfCompleted = 0;

    tasks.Task.forEach((task) => {
      if (task.completed) {
        numOfCompleted++;
      }
    });

    res.render("showBucket", { tasks, user_id, numOfCompleted, bucketTitle });
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
