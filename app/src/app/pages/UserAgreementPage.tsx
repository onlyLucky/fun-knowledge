import { motion } from 'motion/react';
import { PageHeader } from '../components/PageHeader';

const SECTIONS = [
  {
    title: '一、服务协议的范围',
    content:
      '本协议是用户（以下称"您"）与冷知识星球（以下称"本平台"）之间就本平台服务所订立的协议。您在注册、使用本平台任何服务前，应仔细阅读并理解本协议全部内容。',
  },
  {
    title: '二、账号注册与安全',
    content:
      '您注册账号时须提供真实、准确、完整、合法的个人信息。您有责任妥善保管账号及密码，因您保管不善导致账号被盗用或信息泄露所引起的损失由您自行承担。',
  },
  {
    title: '三、用户行为规范',
    content:
      '您承诺不会利用本平台服务从事违法违规活动，包括但不限于：传播违法信息、侵犯他人知识产权、散布谣言、实施网络攻击等。违者本平台有权封停账号并追究相应责任。',
  },
  {
    title: '四、知识产权',
    content:
      '本平台上的所有内容，包括但不限于文字、图片、音视频，其知识产权均归本平台或相关权利人所有。未经书面授权，任何人不得以任何形式复制、转载、摘编或以其他方式使用本平台内容。',
  },
  {
    title: '五、免责声明',
    content:
      '本平台提供的知识内容仅供参考，不构成任何专业建议。本平台尽力保证内容的准确性，但对于内容的完整性、准确性、时效性不作任何保证。',
  },
  {
    title: '六、协议的修改',
    content:
      '本平台有权随时对本协议进行修改，修改后的协议将在平台公告后生效。您继续使用本平台服务即表示接受修改后的协议。',
  },
  {
    title: '七、适用法律',
    content:
      '本协议的签订、生效、履行、解释及纠纷解决均适用中华人民共和国法律。因本协议引起的或与之相关的任何纠纷，双方应友好协商解决。',
  },
];

export function UserAgreementPage() {
  return (
    <div className="flex flex-col h-full bg-[#F2F2F2]">
      <PageHeader title="用户协议" subtitle="最后更新于 2026年1月1日" />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 space-y-3">
        {/* Intro */}
        <div className="bg-[#292526] rounded-[20px] p-5">
          <p className="text-[#FDFDFD]/80 text-[13px] leading-relaxed">
            欢迎使用冷知识星球！在使用我们的服务之前，请仔细阅读以下用户协议。使用本服务即表示您同意遵守以下条款。
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-[#FDFDFD] rounded-[18px] p-4 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]"
          >
            <p className="text-[13px] font-bold text-[#121111] mb-2">{section.title}</p>
            <p className="text-[13px] text-[#787676] leading-[1.8]">{section.content}</p>
          </motion.div>
        ))}

        <div className="flex flex-col items-center gap-1 py-3">
          <p className="text-[11px] text-[#DFDEDE]">© 2026 冷知识星球 All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
