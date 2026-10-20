module.exports=async function openAdminTool(page,target){
 await target.waitFor({state:'attached'});
 const index=await target.evaluate(node=>{const panel=node.closest('.pool-admin-screen');return panel?[...panel.parentElement.querySelectorAll(':scope > .pool-admin-screen')].indexOf(panel):-1});
 if(index<0)return;
 if(await target.isVisible())return;
 const back=page.locator('.pool-admin-back:visible');if(await back.count())await back.click();
 await page.locator('.pool-admin-tools:visible .pool-admin-tool').nth(index).click();
};
