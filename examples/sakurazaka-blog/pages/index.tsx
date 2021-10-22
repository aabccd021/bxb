import type { NextPage } from "next";

import { useDocCreation } from "../hooks/useDoc";

const Home: NextPage = () => {
  const userCreation = useDocCreation("article");
  const { state } = userCreation;
  return (
    <>
      {state === "initial" && <div>Initial</div>}
      {state === "creating" && <div>Creating</div>}
      {state === "error" && <div>Error</div>}
      {state === "created" && <div>Created</div>}
      {state === "notCreated" && (
        <>
          Not Created
          <button
            onClick={() => {
              userCreation.createDoc({ text: "a", ownerUser: "a" });
            }}
          >
            Create
          </button>
        </>
      )}
    </>
  );
};

export default Home;
// const userCard: Doc<User_Card> = useViewable(['user', 'xxx'], { view: 'card' });
// const userDetail: Doc<User_Detail> = useViewable(['user', 'xxx'], {
//   view: 'detail',
// });
// const user: Doc<User> = useViewable(['user', 'xxx']);
