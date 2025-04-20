import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative bg-zinc-100 dark:bg-zinc-800 rounded-lg shadow-xl w-[45vw] h-[45vh] overflow-y-auto brushed-metal dark:brushed-metal">
        {/* Header */}
        {title && (
          <div className="px-6 py-4 border-b border-[#999] bg-gradient-to-b from-[#f2f2f2] to-[#cfcfcf] dark:from-zinc-800 dark:to-zinc-900 box-shadow-[inset_0_-1px_0_#aaa]">
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
              {title}
            </h2>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-300"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
