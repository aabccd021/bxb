"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("next/dist/client/router");
const react_1 = require("react");
const generated_1 = require("../../generated");
function Created({ creation: { createdDoc } }) {
    const router = (0, router_1.useRouter)();
    (0, react_1.useEffect)(() => {
        router.push(`/thread/${encodeURIComponent(createdDoc.id)}?useLocalData=true`);
    }, [router, createdDoc.id]);
    return <p>Redirecting</p>;
}
function Page() {
    const creation = (0, generated_1.useThreadCreation)();
    return (<>
      {creation.state === 'notCreated' && (<button onClick={() => {
                creation.createDoc({});
            }}>
          Create
        </button>)}

      {creation.state === 'created' && <Created creation={creation}/>}
    </>);
}
exports.default = Page;
