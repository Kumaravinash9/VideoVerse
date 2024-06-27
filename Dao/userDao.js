const { db } = require("../Utils/dbConfig");

const createUser = async (user) => {
  const id = user.uid;
  const userJson = {
    name: user.name,
    email: user.email,
    online: true,
    uid: id,
  };
  const usersDb = db.collection("users");
  return await usersDb.doc(id).set(userJson);
};

const updateOnlineStatus = async (uid, online) => {
  const usersDb = db.collection("users");
  await usersDb.doc(uid).update({
    online: online,
  });
};

const fetchUsers = async (uid) => {
  const usersDb = db.collection("users").doc(uid);
  return await usersDb.get();
};

const createOnlineUsers = async (user) => {
  const id = user.uid;
  const usersDb = db.collection("liveUsers");
  const userData = await usersDb
    .doc(id)
    .set({ email: user.email, uid: id, online: true });
  return userData;
};

const deleteOnlineUsers = async (user) => {
  const id = user.uid;
  const usersDb = db.collection("liveUsers");
  await usersDb.doc(id).delete();
};

const getOnlineUsers = async (uid) => {
  const usersDb = db.collection("users").where("online", "==", true);
  return usersDb.get().then((q) => {
    let uids = [];
    q.forEach((doc) => {
      if (doc.data().uid != uid) {
        console.log(doc.data());
        uids.push(doc.data());
      }
    });
    return uids;
  });
};

module.exports = {
  createUser,
  createOnlineUsers,
  deleteOnlineUsers,
  getOnlineUsers,
  fetchUsers,
  updateOnlineStatus,
};
