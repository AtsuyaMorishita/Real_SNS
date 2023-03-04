import { MoreVert } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
// import { Users } from "../../dammyData";
import "./Post.css";
import axios from "axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../state/AuthContext";

export const Post = ({ post }) => {
  console.log("投稿情報", post);

  const PUBLIC_FOLDER = process.env.REACT_APP_PUBLIC_FOLDER;

  //いいねの数を管理
  const [like, setLike] = useState(post.likes.length);
  //いいねを押しているかの状態
  const [isLiked, setIsLiked] = useState(false);

  const { user: currentUser } = useContext(AuthContext);

  //DBから取得するユーザー情報を管理
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      const response = await axios.get(`/users?userId=${post.userId}`);
      setUser(response.data);
    };
    fetchUser();
  }, [post.userId]);

  //いいねの処理
  const handleLike = async () => {
    try {
      //いいねのAPIを叩いていく
      await axios.put(`posts/${post._id}/like`, { userId: currentUser._id });
    } catch (err) {
      console.log(err);
    }

    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <Link to={`/profile/${user.username}`}>
              <img
                src={
                  user.profilePicture
                    ? `${PUBLIC_FOLDER}/${user.profilePicture}`
                    : `${PUBLIC_FOLDER}/person/noAvatar.png`
                }
                alt=""
                className="postProfileImg"
              />
            </Link>

            <span className="postUserName">{user.username}</span>
            <span className="postDate">{format(post.createdAt)}</span>
          </div>
          <div className="postRight">
            <MoreVert />
          </div>
        </div>

        <div className="postCenter">
          <span className="postText">{post.desc}</span>
          {post.img && (
            <img src={PUBLIC_FOLDER + post.img} alt="" className="postImg" />
          )}
        </div>

        <div className="postBottom">
          <div className="postBottomLeft">
            <img
              src={PUBLIC_FOLDER + "/heart.png"}
              alt=""
              className="likeIcon"
              onClick={() => handleLike()}
            />
            <span className="postLikeCounter">{`${like}人がいいねを押しました`}</span>
          </div>
          <div className="postBottomRight">
            <span className="postCommentText">{`${post.comment}:コメント`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
