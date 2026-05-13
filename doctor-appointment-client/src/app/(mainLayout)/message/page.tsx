import React from "react";


export const metadata = {
    title: "Message | Fuez Enabling South Africa",
    description: "Message",
};

export default function Message() {
    return (<div className="flex items-center justify-center w-full">
              <div className="text-center p-6">
                <h3 className="text-lg font-medium text-gray-500">
                  Select a conversation
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Choose a chat from the sidebar to start messaging
                </p>
              </div>
            </div>)
}
