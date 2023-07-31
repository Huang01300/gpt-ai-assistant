// 假設您之前已經在相應位置引入了所需的模組和函式
// 例如：import { replyMessage } from '../utils/index.js';
// import { ... } from './handlers/index.js';
// import Context from './context.js';
// import Event from './models/event.js';
// import { Prompt, getPrompt, setPrompt, removePrompt } from './path/to/prompt-manager.js';

/**
 * @param {Context} context
 * @returns {Promise<Context>}
 */
const handleContext = async (context) => (
  activateHandler(context)
  || commandHandler(context)
  || continueHandler(context)
  || deactivateHandler(context)
  || deployHandler(context)
  || docHandler(context)
  || drawHandler(context)
  || forgetHandler(context)
  || enquireHandler(context)
  || reportHandler(context)
  || retryHandler(context)
  || searchHandler(context)
  || versionHandler(context)
  || talkHandler(context)
  || context
);

/**
 * @param {string} userId
 * @param {Prompt} prompt
 */
const addPromptToUserReply = (userId, prompt) => {
  const userReply = getPrompt(userId).getUserReply();
  const fullPrompt = `${prompt} ${userReply}`;
  setPrompt(userId, fullPrompt);
};

const handleEvents = async (events = []) => {
  const promises = [];

  for (const event of events) {
    const { source, message } = event;

    if (source && source.userId && message && (message.type === 'text' || message.type === 'audio')) {
      const userId = source.userId;
      const userMessage = message.text || ''; // 音頻訊息的處理這裡只是示範，實際應根據您的需求處理

      // 預先設置的 Prompt
      const predefinedPrompt = "你好 ChatGPT! 在這個聊天里, 我想讓你做我的熱量攝取計算助手。你是一名營養專家。在這一天里，我會輸入我所有的飲食，我希望你幫我完成以下的任務: 1. 收集我輸入的全部飲食名稱以及份量，根據你在網路上找到的營養成分，計算三項分別是碳水化合物、脂肪、蛋白質的含量以及熱量總和。2.紀錄一天所有的飲食項目，同時紀錄熱量總和以及三項營養指標以及像專業的營養師給我飲食攝取的建議。請注意: 在這一天里，無論我輸入什麼內容，你都只需要回復那項飲食的三項營養成分與總熱量 . 只有當我輸入"結束"的時候，你才開始執行希望你幫我完成的任務. 執行完任務重新開始新一次紀錄。謝謝你！";

      // 加入預先設置的 Prompt 到用戶回覆的開頭
      addPromptToUserReply(userId, predefinedPrompt);

      const context = new Context(event);
      await context.initialize();

      // 處理用戶的回覆訊息
      await handleContext(context);

      // 將處理用戶回覆後的 Context 物件添加到 promises 陣列中
      promises.push(context);
    }
  }

  // 透過 Promise.all 處理所有需要回覆用戶的 Context 物件
  const contexts = await Promise.all(promises);
  return Promise.all(contexts.map((context) => replyMessage(context)));
};

export default handleEvents;

