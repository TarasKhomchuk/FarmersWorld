const DEFAULT_DELAY = 500//2 * 1000

const DELAY_EACH_ITEM = 2 * 1000//20 * 1000
const DELAY_AFTER_READ_ALL_ITEMS = 300 * 1000
const DELAY_AFTER_CLICKED_ITEM = 1 * 1000
const POPUP_APPEAR_TIMER = 2 * 1000
// const ENERGY_THRESHOLD_PERCENT = 60
// const ITEM_DURABILITY_THRESHOLD_PERCENT = 15 // should be removed
const ENERGY_THRESHOLD = 600

const DELAY_NO_RESOURCE = 1000*60*15; // 15 min if no resources

async function delay(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// function currentDatetime() {
//   d = new Date()
//   return d.toISOString()
// }

function percentage(a, b) {
  return parseFloat(((a/b)*100).toFixed(2))
}

function closeModal() {
  const modalConfirmBtn = document.getElementsByClassName('plain-button short undefined')[0]
  const modalPageContainer = document.getElementsByClassName(' modal-content mid');

  if (modalPageContainer && modalPageContainer.innerText){
    console.log(modalPageContainer.innerText);
  }

  if (modalConfirmBtn && modalConfirmBtn.innerText.toUpperCase() === 'OK') {
    modalConfirmBtn.click();
  } else {
    // work around in case of the program cannot find OK button
    // just click any elemen outside modal to close
    document.getElementById('root').click()
  }
}

async function mine(itemName) {
  const btn = document.getElementsByClassName('button-section set-height')[0]

  if (btn && btn.innerText === 'Mine') {
    btn.click();
    await delay(POPUP_APPEAR_TIMER);

    let noResources = await checkNoResources();
    if (noResources){
      let currTime = new Date();
      currTime.setMilliseconds(currTime.getMilliseconds() + DELAY_NO_RESOURCE);
      console.log('Next refresh time: ' + formatDateTime(currTime));
      await delay(DELAY_NO_RESOURCE);
    }else
      console.log(`${formatDateTime(new Date())} mined ${itemName}`)

    closeModal()
  }
}
async function getNewTime(newTime = '00:00:00'){
  // debugger;
  let timeArr = newTime.split(':');
  let startTime = new Date();
  startTime.setMilliseconds(startTime.getMilliseconds() + (timeArr[2]*1000 + timeArr[1]*60*1000 + timeArr[0]*3600*1000))
  return startTime
}

async function getNextTimeRun(){
  return document.querySelector("div.card-container--time").textContent
}

async function claim(itemName) {
  const btn = document.getElementsByClassName('button-section set-height')[0]

  if (btn && btn.innerText === 'Claim') {
    btn.click();
    console.log(`${formatDateTime(new Date())} !! Claimed ${itemName}}`)
    
    await delay(POPUP_APPEAR_TIMER)
    
    closeModal()
  }
}

async function repair(itemName) {
  const activeButtons = document.getElementsByClassName('button-section set-height');
  const repairButtonIsActive = activeButtons.length === 2 && activeButtons[1].innerText === 'Repair';
  const isDamaged =  activeButtons[0].innerText === 'Damaged';

  if (repairButtonIsActive) {
    // const itemDurabilityNumbers = document.querySelector('.card-number').innerText.split('/ ')
    // const itemDurabilityPercent = percentage(itemDurabilityNumbers[0], itemDurabilityNumbers[1])
    // const shouldRepair = itemDurabilityPercent < ITEM_DURABILITY_THRESHOLD_PERCENT

    // if (shouldRepair) {
    if(isDamaged){
      activeButtons[1].click()

      await delay(POPUP_APPEAR_TIMER)

      console.log(`${formatDateTime(new Date())} item "${itemName}" was repaired`)
    }
  }
}

async function rechargeEnergy() {
  const resources = document.querySelectorAll(".resource__group")

  if (resources.length) {
    let remainFood = parseInt(resources[0].innerText)

    const energyNumbers = resources[3].innerText.split('\n/')
    const remainEnergy = energyNumbers[0]

    // if energy lower than theshold, fill it
    if (remainEnergy <= ENERGY_THRESHOLD && remainFood > 0) {
      console.log(`${formatDateTime(new Date())} filling the energy. Remain energy is lower than threshold: ${remainEnergy.parseInt + 1}`)

      // click + to add energy
      document.querySelector('.resource-energy--plus').click()
      await delay(DEFAULT_DELAY)

      const modalInput = document.querySelector(".modal-input");
      // while (true) {
      while(remainFood > 1 && parseInt(modalInput.value) < parseInt(modalInput.max)){
        const energyValue = document.querySelector(".modal-input").value
        // click + icon
        document.querySelector("img[alt='Plus Icon']").click();
        remainFood -= 1;
      }

      if(parseInt(modalInput.value) > 0){
        console.log(`${formatDateTime(new Date())} energy to be filled ${modalInput.value}`)

        // click "Exchange" button to submit
        Array.from(document.querySelectorAll("div.plain-button"))
          .find(elm => elm.textContent == 'Exchange').click()
      }else{
        //close modal page
        document.querySelector("img.close-modal").click()
      }
  
    }
  }
}

async function goHome()
{
  const homeBtn = document.querySelector("div.navbar-group")
  homeBtn.click()
}

function formatDateTime(date){
  let D = date.getDate(); D = D > 9 ? D : '0' + D;
  let M = date.getMonth()+1; M = M > 9 ? M : '0' + M;
  let h = date.getHours(); h = h > 9 ? h : '0' + h;
  let m = date.getMinutes(); m = m > 9 ? m : '0' + m;
  let s = date.getSeconds(); s = s > 9 ? s : '0' + s;

  return `[${D}/${M}/${date.getFullYear()} ${h}:${m}:${s}:${date.getMilliseconds()}]`;
}

async function setNextItemDelay(minRefreshTime){
  // debugger;
  let currTime = new Date();
  let newDelay=0;
  if (minRefreshTime && minRefreshTime > currTime)
    newDelay = minRefreshTime - currTime;
  else
    newDelay = DELAY_AFTER_READ_ALL_ITEMS;

  if (newDelay > 0)
    currTime.setMilliseconds(currTime.getMilliseconds() + newDelay);

  console.log('Next refresh time: ' + formatDateTime(currTime));
  await delay(newDelay);
}

async function checkNoResources(){
  const page = document.querySelector(".modal-stake-header");
  if(page){
    console.log(page.innerText);
    return true;
  }
  return false;
}

while(true) {
  let minRefreshTime;

  await rechargeEnergy()
  await delay(DEFAULT_DELAY)

  let itemsElm=document.querySelector("section.vertical-carousel-container");
  if (!itemsElm) {
    await goHome();
    await delay(DEFAULT_DELAY);
    itemsElm=document.querySelector("section.vertical-carousel-container");
  }

  if (itemsElm) {
    const items=itemsElm.children

    for (item of items) {
      item.click()
      await delay(DELAY_AFTER_CLICKED_ITEM)
      
      const itemName = document.querySelector("div.info-title-name").innerText
      
      await repair(itemName);
      await delay(DEFAULT_DELAY);
      
      await mine(itemName);
      await delay(DEFAULT_DELAY);

      // debugger;
      let nextRunTime = await getNextTimeRun();
      let newStartTime = await getNewTime(nextRunTime);
      if(!minRefreshTime || minRefreshTime > newStartTime)
        minRefreshTime = newStartTime;
      
      
      await claim(itemName)
      await delay(DELAY_EACH_ITEM)
    }
  }

  await setNextItemDelay(minRefreshTime);
}
