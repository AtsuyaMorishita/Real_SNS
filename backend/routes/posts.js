const router = require("express").Router();
const { restart } = require("nodemon");
const Post = require("../models/Post");
const User = require("../models/User");

/**
 * 投稿を作成する
 */
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    return res.status(200).json(savedPost);
  } catch (err) {
    return restart.status(500).json(err);
  }
});

/**
 * 投稿を更新する
 */
router.put("/:id", async (req, res) => {
  try {
    //記事があるか判定
    // if (req.params.id !== req.body._id) {
    //   return res.status(500).json("該当の記事はありません");
    // }

    //編集する投稿を取得する
    const editPost = await Post.findById(req.params.id);

    //自分以外のユーザーを排除する
    if (editPost.userId !== req.body.userId) {
      res.status(500).json("他のユーザーは編集できません");
    }

    //実際に編集してDBにセットする
    await editPost.updateOne({
      $set: req.body,
    });

    return res.status(200).json("記事を編集しました");
  } catch (err) {
    return res.status(200).json(err);
  }
});

/**
 * 投稿を削除する
 */
router.delete("/:id", async (req, res) => {
  try {
    //記事があるか判定
    if (req.params.id !== req.body._id) {
      return res.status(500).json("該当の記事はありません");
    }

    //削除する投稿を取得する
    const deletePost = await Post.findById(req.params.id);

    //自分以外のユーザーを排除する
    if (deletePost.userId !== req.body.userId) {
      res.status(500).json("他のユーザーは削除できません");
    }

    //記事を削除する
    await deletePost.deleteOne();

    return res.status(200).json("記事を削除しました");
  } catch (err) {
    return res.status(200).json(err);
  }
});

/**
 * 投稿を取得する
 */
router.get("/:id", async (req, res) => {
  try {
    //記事があるか判定
    if (req.params.id !== req.body._id) {
      return res.status(500).json("該当の記事はありません");
    }

    //特定の記事を取得する ※誰でも見れる状態
    const post = await Post.findById(req.params.id);

    return res.status(200).json(post);
  } catch (err) {
    return res.status(200).json(err);
  }
});

/**
 * 特定の投稿にいいねを押す
 * :id -> 投稿ID
 * userId -> ログイン中のユーザーID
 */
router.put("/:id/like", async (req, res) => {
  try {
    //特定の記事を取得
    const post = await Post.findById(req.params.id);

    //まだ投稿にいいねが含まれていなければ
    if (!post.likes.includes(req.body.userId)) {
      //いいね配列に追加
      await post.updateOne({
        $push: {
          likes: req.body.userId,
        },
      });

      return res.status(200).json("いいね！！");
    } else {
      //既に投稿があれば取り除く
      await post.updateOne({
        $pull: {
          likes: req.body.userId,
        },
      });

      return res.status(403).json("いいね外した！！");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * タイムラインの投稿を取得する
 * 自分の投稿とフォロー中の投稿 HOMEで使用
 */
router.get("/timeline/:userId", async (req, res) => {
  try {
    //自分の投稿を取得
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({
      userId: currentUser._id,
    });

    //自分がフォローしているユーザーの投稿を全て取得
    const friendsPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({
          userId: friendId,
        });
      })
    );

    return res.status(200).json(userPosts.concat(...friendsPosts));
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * プロフィール専用のタイムライン
 */
router.get("/profile/:username", async (req, res) => {
  try {
    //自分の投稿を取得
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });

    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
