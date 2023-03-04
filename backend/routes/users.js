const router = require("express").Router();
const User = require("../models/User");

//CRUD操作

/**
 * ユーザー情報の更新
 * ユーザーIDと更新する情報が必要
 */
router.put("/:id", async (req, res) => {
  // 送信したユーザーIDとURLのparamsが一致していれば編集
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("ユーザー情報が更新されました");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res
      .status(403)
      .json("あなたは自分のアカウントの時だけ情報を更新できます");
  }
});

/**
 * ユーザー情報の削除
 * ユーザーIDとパスワードが必要
 */
router.delete("/:id", async (req, res) => {
  // 送信したユーザーIDとURLのparamsが一致していれば編集可能
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      //パスワードが合っていれば編集可能
      const user = await User.findOne({ password: req.body.password });
      if (!user) return res.status(500).json("パスワードが異なります");

      //idが一致するユーザーを削除する
      await User.findByIdAndDelete(req.body.userId);

      res.status(200).json("ユーザー情報が削除されました");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res
      .status(500)
      .json("あなたは自分のアカウントの時だけ情報を削除できます");
  }
});

/**
 * 特定のユーザー情報の取得
 * タイムラインで流れてくるユーザーを見る
 */
// router.get("/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     //パスワード等送られたくないものは削除
//     const { password, updatedAt, ...other } = user._doc;
//     return res.status(200).json(other);
//   } catch (err) {
//     return res.status(500).json(err);
//   }
// });

/**
 * クエリでユーザー情報を取得
 */
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;

  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });

    //パスワード等送られたくないものは削除
    const { password, updatedAt, ...other } = user._doc;
    return res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * ユーザーのフォロー
 */
router.put("/:id/follow", async (req, res) => {
  //フォローできる対象に自分は排除する
  if (req.body.userId !== req.params.id) {
    try {
      //フォローするユーザー
      const user = await User.findById(req.params.id);

      //自分
      const currentUser = await User.findById(req.body.userId);

      //フォローする相手ユーザーのフォロワーに自分がいなければ
      if (!user.followers.includes(req.body.userId)) {
        //相手のフォロワーを追加する
        await user.updateOne({
          $push: {
            followers: req.body.userId,
          },
        });

        //自分のフォローを追加する
        await currentUser.updateOne({
          $push: {
            followings: req.params.id,
          },
        });

        return res.status(200).json("フォローに成功しました");
      } else {
        return res
          .status(403)
          .json("あなたはすでにこのユーザーをフォローしています");
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json("自分自身をフォローできません");
  }
});

/**
 * ユーザーのフォローを外す
 */
router.put("/:id/unfollow", async (req, res) => {
  //フォロー解除できる対象に自分は排除する
  if (req.body.userId !== req.params.id) {
    //フォロー解除できる対象に自分は排除する
    try {
      //フォロー解除するユーザー
      const user = await User.findById(req.params.id);

      //自分
      const currentUser = await User.findById(req.body.userId);

      //フォロワーに自分が存在していれば
      if (user.followers.includes(req.body.userId)) {
        //相手のフォロワーを削除する
        await user.updateOne({
          $pull: {
            followers: req.body.userId,
          },
        });

        //自分のフォローを削除する
        await currentUser.updateOne({
          $pull: {
            followings: req.params.id,
          },
        });

        return res.status(200).json("フォロー解除しました");
      } else {
        return res
          .status(403)
          .json("あなたはこのユーザーをフォローしていません");
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json("自分自身をフォローはしていません");
  }
});

module.exports = router;
