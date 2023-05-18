const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserFollowing,
  getAllTags,
  messagesByTag,
  getAllMessages,
  getBucketIdByBucketTitle,
  getUserIdByBucketId,
} = require("../database");
const querystring = require("querystring");

const { bucket } = require("../prisma/client");

const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));

const { ensureAuthenticated } = require("../middleware");

router.use(ensureAuthenticated);

router.get("/", async (req, res) => {
  try {
    const data = await getUserFollowing(req.user.id);
    const followings = Object.values(data).flat();
    const tags = await getAllTags();
    res.render("search", { data: followings, tags });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

router.post("/", async (req, res) => {
  try {
    const { searchInput } = req.body;

    const data = await getUserFollowing(req.user.id);
    const followings = Object.values(data).flat();

    const followingBuckets = followings.map((following) =>
      following.buckets.map((bucket) => ({
        id: bucket.id,
        title: bucket.title,
      }))
    );

    const tags = await getAllTags();

    const followingNames = followings.map((following) => ({
      followingId: following.id,
      username: following.username,
    }));

    const followingBucketTitles = followingBuckets
      .flat()
      .map(({ title }) => title);

    let allSimilarBucket = [];
    const allUsers = await getAllUsers();

    const matchingTag = tags.find(
      (tag) => tag.tagName.toLowerCase() === searchInput.toLowerCase()
    );

    const matchingName = followingNames.find(
      (name) => name.username.toLowerCase() === searchInput.toLowerCase()
    );

    const findingNewUser = allUsers.find(
      (name) => name.username.toLowerCase() === searchInput.toLowerCase()
    );

    if (!matchingTag && !matchingName) {
      followingBucketTitles.forEach((bucketTitle) => {
        const bucketWordsArr = bucketTitle.toLowerCase().split(" ");
        const searchInputArr = searchInput.toLowerCase().split(" ");

        for (let i = 0; i < searchInputArr.length; i++) {
          for (let j = 0; j < bucketWordsArr.length; j++) {
            if (bucketWordsArr[j] === searchInputArr[i]) {
              allSimilarBucket.push(bucketTitle);
            }
          }
        }
      });
    }

    const uniqueBucketTitles = [...new Set(allSimilarBucket)];

    async function getBucketIds(arr) {
      return await Promise.all(
        arr.map(async (title) => await getBucketIdByBucketTitle(title))
      );
    }

    if (matchingTag) {
      const tagId = matchingTag.id;
      const tag_id = Number(tagId);
      res.redirect(`/search/tag/${tag_id}`);
    } else if (matchingName) {
      const userId = matchingName.followingId;
      const user_id = Number(userId);
      res.redirect(`/profile/${user_id}`);
    } else if (uniqueBucketTitles.length > 0) {
      const data = await getBucketIds(uniqueBucketTitles);
      const queryString = querystring.stringify({ data: JSON.stringify(data) });
      res.redirect(`/search/search/?${queryString}`);
    } else if (findingNewUser) {
      const userId = findingNewUser.id;
      const user_id = Number(userId);
      res.redirect(`/profile/${user_id}`);
    } else {
      res.redirect("/search/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

router.get("/tag/:tag_id", async (req, res) => {
  try {
    const user_id = req.user.id;
    const tag_id = Number(req.params.tag_id);
    const data = await messagesByTag(user_id, tag_id);
    res.render("messageByTag", { data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

router.get("/search", async (req, res) => {
  try {
    const user_id = req.user.id;
    const queryString = req.originalUrl.split("?")[1];
    const decodedQuery = decodeURIComponent(queryString);
    const { data } = querystring.parse(decodedQuery);

    const possibleBucketIds = JSON.parse(data);
    const BucketUsers = await Promise.all(
      possibleBucketIds.map(async (bucket) => {
        return await getUserIdByBucketId(bucket.id);
      })
    );

    const allMessages = await Promise.all(
      BucketUsers.map((user) => getAllMessages(user.userId))
    );
    const allMessage = allMessages.flat();

    const filteredMessages = allMessage.filter((message) =>
      possibleBucketIds.some((bucket) => bucket.id === message.bucket.id)
    );

    const uniqueMessages = filteredMessages.filter(
      (message, index) =>
        index ===
        filteredMessages.findIndex(
          (obj) => JSON.stringify(obj) === JSON.stringify(message)
        )
    );

    res.render("possibleBuckets", { feed: uniqueMessages, user_id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
