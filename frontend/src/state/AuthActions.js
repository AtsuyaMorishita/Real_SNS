//ユーザー入力に応じたアクションの設定
export const LoginStart = (user) => ({
  Type: "LOGIN_START",
});

export const LoginSuccess = (user) => ({
  Type: "LOGIN_SUCCESS",
  payload: user, //DBから取得したユーザー情報
});

export const LoginError = (error) => ({
  Type: "LOGIN_ERROR",
  payload: error,
});
