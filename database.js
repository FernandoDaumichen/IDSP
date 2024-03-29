const prisma = require("./prisma/client");

const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, profileImg: true },
    });
    return users;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const changeProfilePhoto = async (user_id, photoUrl) => {
  try {
    
    await prisma.user.update({
      where: { id: user_id },
      data: { profileImg: photoUrl },
    });
  } catch (error) {
    console.log(error)
  }
};

const deleteProfilePhoto = async (user_id) => {
  const updatedUser = await prisma.user.update({
    where: { id: user_id },
    data: {
      profileImg:
        "https://i.pinimg.com/originals/f1/0f/f7/f10ff70a7155e5ab666bcdd1b45b726d.jpg",
    },
  });
  return updatedUser;
};

const getBucketByBucketId = async (bucketId) => {
  const bucket = await prisma.bucket.findUnique({ where: { id: bucketId } });
  return bucket;
};

const getBucketTitleByMessageId = async (messageId) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        bucket: {
          select: {
            title: true,
          },
        },
      },
    });
    return message?.bucket?.title || null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const likeMessage = async (userId, messageId) => {
  try {
    await prisma.like.create({
      data: {
        user: { connect: { id: userId } },
        message: { connect: { id: messageId } },
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const getLikeIdByUserIdMessageId = async (userId, messageId) => {
  try {
    const like = await prisma.like.findFirst({
      where: {
        userId,
        messageId,
      },
    });
    return like ? like.id : null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const UnlikeMessage = async (userId, messageId) => {
  try {
    const likeId = await getLikeIdByUserIdMessageId(userId, messageId);
    await prisma.like.delete({
      where: {
        id: likeId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const commentMessage = async (comment, message_id, user_id) => {
  try {
    const newComment = await prisma.comment.create({
      data: {
        content: comment,
        messageId: message_id,
        userId: user_id,
      },
    });
    return newComment;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getBucketTitleByBucketId = async (id) => {
  try {
    const bucket = await prisma.bucket.findUnique({
      where: { id: id },
      select: { title: true, id: true },
    });
    return bucket;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getBucketIdByBucketTitle = async (bucket_title) => {
  try {
    const bucket = await prisma.bucket.findFirst({
      where: { title: bucket_title },
      select: { id: true },
    });
    return bucket ? bucket.id : null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const completeBucketlist = async (bucketId) => {
  try {
    await prisma.bucket.update({
      where: { id: bucketId },
      data: { completed: true },
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteBucketlist = async (bucketId) => {
  try {
    await prisma.bucket.delete({
      where: { id: bucketId },
      include: { Task: true, messages: true },
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteMessage = async (messageId) => {
  try {
    await prisma.message.delete({
      where: { id: messageId },
    });
  } catch (error) {
    console.log(error);
  }
};

const addTask = async (taskMessage, bucketId) => {
  try {
    const newTask = await prisma.task.create({
      data: {
        message: taskMessage,
        completed: false,
        bucket: { connect: { id: bucketId } },
      },
    });
    return newTask;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const updateTask = async (completion, task_id) => {
  try {
    const task = await prisma.task.update({
      where: {
        id: task_id,
      },
      data: {
        completed: completion,
      },
    });
    return task;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const updateMessage = async (messageId, messageContent) => {
  try {
    const message = await prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        content: messageContent,
      },
    });
    return message;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getTasks = async (bucketId) => {
  try {
    const tasks = await prisma.bucket.findUnique({
      where: { id: bucketId },
      select: { Task: true },
    });
    return tasks;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const changeUsername = async (userId, newUsername) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { username: newUsername },
    });
  } catch (error) {
    console.log(error);
  }
};

const getUserByUserId = async (user_id) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(user_id) },
    });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};



const createNewBucket = async (dueDate, newBucket, userId, tagId) => {
  try {
    const newBucketlist = await prisma.bucket.create({
      data: {
        dueDate: new Date(dueDate),
        title: newBucket,
        user: { connect: { id: userId } },
        tag: { connect: { id: tagId } },
        completed: false,
      },
    });
    return newBucketlist;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getUserByUsernameAndPassword = async (username, password) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (user && user.password === password) {
      return user;
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getUserByUsername = async (username) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getSecretFromUser = async (username) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
      select: { secretQuestion: true, secretAnswer: true },
    });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const updatePassword = async (username, password) => {
  try {
    await prisma.user.update({
      where: { username },
      data: {
        password,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const createUser = async (user) => {
  try {
    const { email, username, password, secretQuestion, secretAnswer } = user;
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return null;
    } else {
      const newUser = await prisma.user.create({
        data: {
          email,
          username,
          password,
          secretQuestion,
          secretAnswer,
          profileImg:
            "https://i.pinimg.com/originals/f1/0f/f7/f10ff70a7155e5ab666bcdd1b45b726d.jpg",
          following: { connect: { id: 1 } },
        },
      });
      return newUser;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getAllComments = async (message_id) => {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        messageId: message_id,
      },
    });
    return comments;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getMessageByMessageId = async (messageId) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        content: true,
        photo: true,
        bucketId: true,
        createdAt: true,
        likes: true,
      },
    });
    return message;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const showBuckets = async (status, currentUser) => {
  try {
    let buckets = null;
    if (status === "all") {
      buckets = await prisma.bucket.findMany({
        where: { userId: currentUser },
        select: { id: true, title: true },
      });
    } else if (status === "completed") {
      buckets = await prisma.bucket.findMany({
        where: {
          AND: [{ userId: currentUser }, { completed: true }],
        },
        select: { id: true, title: true },
      });
    } else if (status === "inprogress") {
      buckets = await prisma.bucket.findMany({
        where: {
          AND: [{ userId: currentUser }, { completed: false }],
        },
        select: { id: true, title: true },
      });
    }
    return buckets;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getAllTags = async () => {
  try {
    const tags = await prisma.tag.findMany();
    return tags;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const addNewMessage = async (content, bucketId) => {
  try {
    const newMessage = await prisma.message.create({
      data: {
        content: content,
        bucket: { connect: { id: Number(bucketId) } },
      },
    });
    return newMessage;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const addNewPhotoMessage = async (content, bucketId, photoUrl) => {
  try {
    const bucket_id = Number(bucketId);
    const newMessage = await prisma.message.create({
      data: {
        content: content,
        bucket: { connect: { id: bucket_id } },
        photo: photoUrl,
      },
    });
    return newMessage;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getUserFollowing = async (user_id) => {
  try {
    const userFollowing = await prisma.user.findUnique({
      where: { id: user_id },
      select: {
        following: {
          select: { id: true, profileImg: true, username: true, buckets: true },
        },
      },
    });
    return userFollowing;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getAllMessageOfOneUser = async (userId) => {
  try {
    const user_id = Number(userId);

    const allMessages = await prisma.message.findMany({
      where: {
        bucket: {
          userId: user_id,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        content: true,
        photo: true,
        createdAt: true,
        likes: true,
        comments: true,
        bucket: {
          select: {
            id: true,
            title: true,
            tag: true,
            completed: true,
            user: {
              select: {
                id: true,
                username: true,
                profileImg: true,
                following: { select: { id: true } },
              },
            },
          },
        },
      },
    });
    return allMessages;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getAllMessages = async (user_id) => {
  try {
    const userMessages = await getAllMessageOfOneUser(user_id);
    const userFollowing = await getUserFollowing(user_id);

    const followingIds = userFollowing.following.map((user) => user.id);
    const followingMessage = await Promise.all(
      followingIds.map(async (id) => {
        return await getAllMessageOfOneUser(id);
      })
    );

    const combinedMessageArr = [...userMessages, ...followingMessage];
    const unsortedResult = combinedMessageArr
      .filter((r) => r.length !== 0)
      .flat();

    return sortPosts(unsortedResult);
  } catch (error) {
    console.log(error);
    return [];
  }
};

const sortPosts = (posts) => {
  try {
    return posts.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  } catch (error) {
    console.log(error);
    return [];
  }
};

const messagesByTag = async (user_id, tag_id) => {
  try {
    const messages = await getAllMessages(user_id);
    const result = messages.filter((msg) => msg.bucket.tag.id === tag_id);
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const messagesByTagFromAllUsers = async (tag_id) => {
  const messages = await prisma.message.findMany({
    where: {
      bucket: {
        tagId: parseInt(tag_id),
      },
    },
    include: {
      bucket: true,
    },
  });
  return messages;
};




const getAllMessagesByBucketId = async (bucketId) => {
  try {
    const messages = await prisma.message.findMany({
      where: { bucketId: bucketId },
      select: {
        id: true,
        content: true,
        bucket: {
          select: {
            id: true,
            title: true,
          },
        },
        likes: true,
        createdAt: true,
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });
    return messages;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getUserIdByBucketId = async (bucketId) => {
  const outcome = await prisma.bucket.findUnique({
    where: { id: parseInt(bucketId) },
    select: { userId: true },
  });
  return outcome;
};

const getMessagesofCertainBucket = async (user_id, bucketId) => {
  const data = await prisma.message.findMany({
    where: {
      bucket: {
        userId: user_id,
        id: bucketId,
      },
    },
  });
  return data;
};

const addFriend = async (user_id, friend_id) => {
  try {
    await prisma.user.update({
      where: { id: user_id },
      data: {
        following: {
          connect: { id: friend_id },
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const removeFriend = async (user_id, friend_id) => {
  try {
    await prisma.user.update({
      where: { id: user_id },
      data: { following: { disconnect: { id: friend_id } } },
    });
  } catch (error) {
    console.log(error);
  }
};

const showBucketforMilestone = async (bucketId) => {
  const Bucket = await prisma.bucket.findUnique({
    where: { id: bucketId },
    select: {
      id: true,
      startDate: true,
      dueDate: true,
      title: true,
      completed: true,
      userId: true,
      Task: true,
    },
  });
  return Bucket;
};

// const main = async() => {
//   await showBucketforMilestone(5);
// };
// main()

module.exports = {
  showBucketforMilestone,
  addFriend,
  removeFriend,
  getAllUsers,
  getMessagesofCertainBucket,
  getAllMessagesByBucketId,
  getAllMessages,
  getUserFollowing,
  changeUsername,
  deleteBucketlist,
  createNewBucket,
  likeMessage,
  UnlikeMessage,
  updateMessage,
  addNewMessage,
  addNewPhotoMessage,
  getBucketTitleByBucketId,
  getTasks,
  getUserIdByBucketId,
  getUserByUsernameAndPassword,
  getUserByUserId,
  getSecretFromUser,
  getUserByUsername,
  createUser,
  deleteMessage,
  showBuckets,
  getAllTags,
  messagesByTag,
  addTask,
  getAllMessageOfOneUser,
  updateTask,
  updatePassword,
  completeBucketlist,
  commentMessage,
  getAllComments,
  getMessageByMessageId,
  getBucketTitleByMessageId,
  getBucketIdByBucketTitle,
  getBucketByBucketId,
  changeProfilePhoto,
  deleteProfilePhoto,
  messagesByTagFromAllUsers,
};
