const express = require("express");
const router = express.Router();
const {
  getAllMessagesByBucketId,
  createNewBucket,
  completeBucketlist,
  getAllMessages,
  deleteBucketlist,
  showBuckets,
  getTasks,
  getAllTags,
  createNewTasks,
  getBucketTitleByBucketId,
  updateTask
} = require("../fake-db");

const { ensureAuthenticated } = require("../middleware");
const { bucket } = require('../prisma/client');
router.use(ensureAuthenticated);
 
router.get("/home", async (req, res) => {
  const user_id = req.user.id;
  const feed = await getAllMessages(user_id);
  res.render("mainfeed", { feed, user_id });
  //
}); 

//☝️ Problem: need to change checkbox to radio (only choosing one)!
router.get("/createBucket", async (req, res) => {
  const user_id = req.user.id;
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
  const day = ('0' + currentDate.getDate()).slice(-2);
  const today = year + '-' + month + '-' + day;
  const tags = await getAllTags();
  res.render("createBucket", { today, tags, user_id });
});

router.post("/createBucket", async (req, res) => {
  const userId = req.user.id;
  const { dueDate, newBucket, tag } = req.body;
  const tag_id = parseInt(tag);
  const NewBucketList = await createNewBucket(dueDate, newBucket, userId, tag_id);
  if(NewBucketList){
      res.redirect("/feeds/buckets?show=inprogress");
  } else {
    res.redirect("/feeds/createBucket");
  }
});

router.get("/createTask", async (req, res) => {
  //how to get the the bucket id that this user just created? 
  const bucketId = parseInt(req.params.bucketid);

  res.render("createTask");
});

router.post("/createTask", async (req, res) => {
  const {task} = req.body;
  if(task.length>0){
    await Promise.all(task.map(async (ele) => {    
      const newDailyTask = await createNewTasks(ele, )
    }))
  }
  res.redirect("/feeds/createMessage");

});

router.get("/buckets", async (req, res) => {
  const { show } = req.query; // "inprogress" "completed"
  const currentUser = req.user;
  const currentUserId = currentUser.id;
  const buckets = await showBuckets(show, currentUser.id);
  res.render("showBuckets", { buckets, user_id: currentUserId });
});

router.post("/completeBuckets", async (req, res) => {
  try {
    const {bucket_id} = req.body;
    const bucketId = Number(bucket_id);
    await completeBucketlist(bucketId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }
});

router.post("/deleteBucket", async ( req , res ) => {
  try {
    const {bucket_id} = req.body;
    const bucketId = Number(bucket_id);
    await deleteBucketlist(bucketId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }

})

router.post("/addTask", async (req, res) => {
  try {
    const { task, path } = req.body;
    const newTask = await createNewTasks(task, Number(path))
    res.status(200).json({ success: true, taskId: newTask.id });
  } catch (error) {
    res.status(500).json({ success: false });
  }
 
})

router.post("/updateTask/:taskId", async (req, res) => {
  try {
    const { completed } = req.body;
    const taskId = req.params.taskId;
    const updatedTask = await updateTask(completed, Number(taskId));
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
 
})

router.get("/createMessage", (req, res) => {
  const bucketTitle = req.query.bucket;
  const user_id = req.user.id;
  const data = getUserFeed(req.user.id);
  res.render("createMessage", { data, user_id, bucketTitle });
});

//☝️ Problem: when un-check, minus -1 progress bar. 
router.get("/bucket/:id", async (req, res) => {
  let numOfCompleted = 0;
  const user_id = req.user.id;
  const tasks = await getTasks(parseInt(req.params.id));
  const bucketTitle = (await getBucketTitleByBucketId(parseInt(req.params.id))).title;

  tasks.Task.forEach(task => {
    if (task.completed) {
      numOfCompleted++;
    }
  });
  res.render("showBucket", { tasks, user_id, numOfCompleted,bucketTitle });
});

router.post("/bucket/:id", async (req, res) => {
  try {
    const {bucket_id} = req.body;
    const bucketId = Number(bucket_id);
    await completeBucketlist(bucketId);
    res.status(200).json({ success: true});
  } catch (error) {
   console.log(error) 
  }
});




module.exports = router;
