/**
 * Reducer
 * @param {初期値} state
 * @param {実行されるアクション} action
 * @returns 新しい状態
 */
const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        isFetching: true,
        error: false,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload,
        isFetching: false,
        error: false,
      };
    case "LOGIN_ERROR":
      return {
        user: null,
        isFetching: false,
        error: true,
      };

    default:
      return state;
  }
};

export default AuthReducer;
