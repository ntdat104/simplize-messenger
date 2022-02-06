import { ChangeEvent, FC, FormEvent, useRef, useState } from 'react';
import { arrayRemove, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../shared/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useNavigate, useParams } from 'react-router-dom';

import Alert from '../Alert';
import { ConversationInfo } from '../../shared/types';
import { THEMES } from '../../shared/constants';
import { formatFileName } from '../../shared/utils';
import { useStore } from '../../store';

interface ConversationConfigProps {
  conversation: ConversationInfo;
  setIsOpened: (value: boolean) => void;
  setMediaViewOpened: (value: boolean) => void;
}

const ConversationSettings: FC<ConversationConfigProps> = ({
  conversation,
  setIsOpened,
  setMediaViewOpened,
}) => {
  const { id: conversationId } = useParams();

  const currentUser = useStore((state) => state.currentUser);

  const navigate = useNavigate();

  const [isChangeChatNameOpened, setIsChangeChatNameOpened] = useState(false);
  const [chatNameInputValue, setChatNameInputValue] = useState(
    conversation?.group?.groupName || ''
  );

  const [isChangeThemeOpened, setIsChangeThemeOpened] = useState(false);

  const [isAlertOpened, setIsAlertOpened] = useState(false);
  const [alertText, setAlertText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!chatNameInputValue.trim()) return;
    setIsOpened(false);
    updateDoc(doc(db, 'conversations', conversationId as string), {
      'group.groupName': chatNameInputValue.trim(),
    });
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image')) {
      setAlertText('File is not an image');
      setIsAlertOpened(true);
      return;
    }

    const FIVE_MB = 1024 * 1024 * 5;

    if (file.size > FIVE_MB) {
      setAlertText('Max image size is 20MB');
      setIsAlertOpened(true);
      return;
    }

    setIsOpened(false);

    const fileReference = ref(storage, formatFileName(file.name));

    await uploadBytes(fileReference, file);

    const downloadURL = await getDownloadURL(fileReference);

    updateDoc(doc(db, 'conversations', conversationId as string), {
      'group.groupImage': downloadURL,
    });
  };

  const changeTheme = (value: string) => {
    updateDoc(doc(db, 'conversations', conversationId as string), {
      theme: value,
    });
  };

  const leaveGroup = () => {
    updateDoc(doc(db, 'conversations', conversationId as string), {
      users: arrayRemove(currentUser?.uid as string),
      'group.admins': arrayRemove(currentUser?.uid as string),
      'group.groupImage': conversation.group?.groupImage,
      'group.groupName': conversation.group?.groupName,
    });

    navigate('/');
  };

  return (
    <div
      onClick={() => setIsOpened(false)}
      className={`fixed top-0 left-0 z-20 flex h-full w-full animate-fade-in items-center justify-center bg-[#00000080] transition-all duration-300`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-2 w-full max-w-[500px] rounded-lg bg-dark"
      >
        <div className="flex items-center justify-between border-b border-dark-lighten py-3 px-3">
          <div className="flex-1"></div>
          <div className="flex flex-1 items-center justify-center">
            <h1 className="whitespace-nowrap text-center text-2xl">
              Conversation settings
            </h1>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <button
              onClick={() => setIsOpened(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-lighten"
            >
              <i className="bx bx-x text-2xl"></i>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-stretch p-3">
          {conversation.users.length > 2 && (
            <>
              <button
                onClick={() => setIsChangeChatNameOpened((prev) => !prev)}
                className="flex items-center justify-between gap-3 rounded-lg bg-dark px-3 py-2 transition duration-300 hover:brightness-125"
              >
                <div className="flex items-center gap-3">
                  <i className="bx bx-edit-alt text-2xl"></i>
                  <span>Change chat name</span>
                </div>

                <i
                  className={`bx bx-chevron-down text-3xl ${
                    isChangeChatNameOpened ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>
              {isChangeChatNameOpened && (
                <form onSubmit={handleFormSubmit} className="my-2 flex gap-3">
                  <div className="flex-grow">
                    <input
                      value={chatNameInputValue}
                      onChange={(e) => setChatNameInputValue(e.target.value)}
                      className="h-full w-full rounded-lg border border-dark-lighten bg-dark p-2 outline-none transition duration-300 focus:border-gray-500"
                      type="text"
                      placeholder="Chat name"
                    />
                  </div>
                  <button className="flex-shrink-0 rounded bg-primary px-3 transition duration-300 hover:brightness-110">
                    Change
                  </button>
                </form>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 rounded-lg bg-dark px-3 py-2 transition duration-300 hover:brightness-125"
              >
                <i className="bx bx-image-alt text-2xl"></i>
                <span>Change group photo</span>
              </button>

              <input
                hidden
                className="hidden"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
              />

              <Alert
                isOpened={isAlertOpened}
                setIsOpened={setIsAlertOpened}
                text={alertText}
                isError
              />
            </>
          )}
          <button
            onClick={() => setIsChangeThemeOpened((prev) => !prev)}
            className="flex items-center justify-between gap-3 rounded-lg bg-dark px-3 py-2 transition duration-300 hover:brightness-125"
          >
            <div className="flex items-center gap-3">
              <i className="bx bx-palette text-2xl"></i>
              <span>Change theme</span>
            </div>

            <i
              className={`bx bx-chevron-down text-3xl ${
                isChangeThemeOpened ? 'rotate-180' : ''
              }`}
            ></i>
          </button>

          {isChangeThemeOpened && (
            <div className="flex flex-wrap gap-3 p-4">
              {THEMES.map((theme) => (
                <div
                  key={theme}
                  style={{ background: theme }}
                  onClick={() => changeTheme(theme)}
                  className={`h-14 w-14 cursor-pointer rounded-full ${
                    conversation.theme === theme ? 'check-overlay' : ''
                  }`}
                ></div>
              ))}
            </div>
          )}
          <button
            onClick={() => {
              setIsOpened(false);
              setMediaViewOpened(true);
            }}
            className="flex items-center gap-3 rounded-lg bg-dark px-3 py-2 transition duration-300 hover:brightness-125"
          >
            <i className="bx bxs-file text-2xl"></i>
            <span>View images & files</span>
          </button>

          {conversation.users.length > 2 && (
            <button
              onClick={() => leaveGroup()}
              className="flex items-center justify-between gap-3 rounded-lg bg-dark px-3 py-2 transition duration-300 hover:brightness-125"
            >
              <div className="flex items-center gap-3">
                <i className="bx bx-log-out text-2xl"></i>
                <span>Leave group</span>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationSettings;
