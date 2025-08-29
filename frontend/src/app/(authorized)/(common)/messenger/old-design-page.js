import { useTranslations } from "next-intl";

import PageTitle from "@/shared/components/pageTitle/page";
import Circle from "@/shared/components/icons/circle";
import Ellipse from "@/shared/components/icons/ellipse";
import PaperPlane from "@/shared/components/icons/paperplane";
import MagnifyingGlass from "@/shared/components/icons/magnifyingGlass";

export function ChatListItem({ name, message, showEllipse = true, date }) {
  return (
    <div className="bg-white p-4 pr-4.5 flex items-center gap-4 hover:bg-color-80">
      <div className="w-[17px]">
        {showEllipse ? (
          <Ellipse color="#564CDF" width={15} height={15} />
        ) : null}
      </div>
      <Circle />
      <div className="w-full">
        <div className="flex justify-between items-start">
          <div className="text-black text-[18px] font-semibold">{name}</div>
          <div className="text-color-35 text-[16px] font-normal">{date}</div>
        </div>

        <div className="text-color-35 text-[18px] font-normal">{message}</div>
      </div>
    </div>
  );
}

export const MessageFromOthers = ({ message, name, time }) => (
  <div className="flex items-start gap-3.5">
    <div className="mt-8">
      <Circle width={48} height={48} />
    </div>
    <div className="max-w-[70%]">
      <div className="flex gap-2 items-center mb-1">
        <span className="text-black text-[18px] font-normal">{name}</span>
        <span className="text-color-35 text-[18px] font-normal">{time}</span>
      </div>
      <div className="bg-color-1 text-black text-[18px] font-normal rounded-5 px-4 py-3">
        {message}
      </div>
    </div>
  </div>
);

export const MessageFromMe = ({ message, time }) => (
  <div className="flex flex-col items-end">
    <div className="text-color-35 text-[18px] font-normal">{time}</div>
    <div className="max-w-[70%] bg-color-61 text-black text-[18px] font-normal rounded-5 px-4 py-3">
      {message}
    </div>
  </div>
);

const ChatBox = ({ messagesByDate }) => {
  return (
    <div className="flex flex-col gap-6 overflow-y-auto h-full">
      {Object.entries(messagesByDate).map(([date, messages]) => (
        <div key={date} className="flex flex-col gap-5">
          <div className="bg-color-83 text-center text-black text-[18px] font-normal py-0.5">
            {date}
          </div>
          {messages.map((msg, index) =>
            msg.fromMe ? (
              <MessageFromMe
                key={index}
                message={msg.message}
                time={msg.time}
              />
            ) : (
              <MessageFromOthers
                key={index}
                message={msg.message}
                time={msg.time}
                name="김철수"
              />
            )
          )}
        </div>
      ))}
    </div>
  );
};

function Messenger() {
  const t = useTranslations();

  const data = [
    {
      name: "김철수",
      message: "보고서 검토 부탁드립니다",
      showEllipse: true,
      date: "10분전",
    },
    {
      name: "김하윤",
      message: "나: 증거물 업로드 했습니다.",
      showEllipse: true,
      date: "1시간 전",
    },
    {
      name: "이준서",
      message: "현지 수사기관과 협조 중입니...",
      showEllipse: false,
      date: "11시간 전",
    },
    {
      name: "박서연",
      message: "해당 서버는 해외에 위치해 있...",
      showEllipse: false,
      date: "13시간 전",
    },
    {
      name: "Olivia Bennett",
      message: "This case has been identi...",
      showEllipse: false,
      date: "18시간 전",
    },
    {
      name: "정지우",
      message: "피의자의 해외 접속 기록과",
      showEllipse: false,
      date: "3일 전",
    },
    {
      name: "Sophia Reed",
      message: "he server in question is loc",
      showEllipse: false,
      date: "17일 전",
    },
    {
      name: "최민준",
      message: "공조국 측에서도 유사 사례로",
      showEllipse: false,
      date: "53일 전",
    },
    {
      name: "Lucas Anderson",
      message: "I've already drafted a prelim",
      showEllipse: false,
      date: "87일 전",
    },
  ];

  const messageData = {
    "25.05.02": [
      {
        message:
          "We've got clearer evidence that this copyright infringement case involves an overseas server.",
        fromMe: false,
        time: "25.05.02 1:21",
      },
      {
        message: "Which country? Were you still tracing the IPs?",
        fromMe: true,
        time: "25.05.02 1:21",
      },
    ],
    "25.05.03": [
      {
        message:
          "Yes, our analysis shows that the content was distributed via a U.S.-based hosting provider. We suspect the domain owner is the same individual.",
        fromMe: false,
        time: "25.05.03 17:15",
      },
      {
        message:
          "Then we should prepare an MLAT request. Let's also consider going through INTERPOL.Then we should prepare an MLAT request. Let's also consider going through INTERPOL.",
        fromMe: true,
        time: "25.05.03 17:18",
      },
      {
        message:
          "I've already drafted a preliminary request. All the details are summarized in the report. Please review the report.",
        fromMe: false,
        time: "25.05.03 17:20",
      },
    ],
  };

  return (
    <div className="messenger">
      <PageTitle title={t("header.messenger")} />
      <div className="flex gap-3">
        <div className="w-[450px] bg-white border border-color-36 rounded-10 pb-4">
          <div className="m-5 h-[60px] bg-color-74 rounded-5 flex items-center p-4">
            <MagnifyingGlass />
            <input
              className="px-4 outline-0 text-color-4 text-[18px] font-normal"
              placeholder={t("placeholder.chat-search")}
            />
          </div>
          {data.map((item, idx) => (
            <ChatListItem
              key={idx}
              name={item.name}
              message={item.message}
              showEllipse={item.showEllipse}
              date={item.date}
            />
          ))}
        </div>
        <div className="flex-1 bg-white border border-color-36 rounded-10">
          <div className="h-[89px] border-b border-color-36 flex items-center px-8">
            <h3 className="text-black text-[24px] font-semibold">김철수</h3>
          </div>
          <div className="p-8  space-y-6 h-screen flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <ChatBox messagesByDate={messageData} />
            </div>

            <div className="h-[62px] flex justify-between items-center gap-4 border border-color-36 bg-white rounded-5 px-4.5">
              <input
                placeholder="메시지를 입력하세요."
                className="placeholder-color-35 text-[18px] font-normal text-color-4 outline-0 w-full"
              />
              <div className="bg-color-20 w-[40px] h-[40px] flex items-center justify-center rounded-5">
                <button className="cursor-pointer">
                  <PaperPlane />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messenger;
