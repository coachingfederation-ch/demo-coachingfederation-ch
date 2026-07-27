import { issueClaimLinkForMember } from "@/lib/member-claim.server";
const res = await issueClaimLinkForMember(
  "706713f9-e826-4088-9840-acd5fca08ddb",
  "a5a77c28-f39a-415f-bb4e-d1cd5be1018a",
  "http://localhost:8080",
);
console.log(JSON.stringify(res));
