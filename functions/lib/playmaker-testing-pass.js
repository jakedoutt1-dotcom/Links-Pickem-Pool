// Permanent complimentary testing entitlement. The identifier is matched only
// against a server-verified account; body fields and browser storage grant nothing.
export const PLAYMAKER_TEST_OWNER='9e5f8fa76c8f4bc2ebcb0ef635040352abfcc6e74c75b956f92799f8eea61cb8';
export function playmakerTestingPass(owner,verifiedAccount){return !!verifiedAccount&&owner===PLAYMAKER_TEST_OWNER}
