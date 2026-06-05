"use client";

interface PhonePreviewProps {
  children: React.ReactNode;
  contactName?: string;
}

export function PhonePreview({ children, contactName = "Sua Empresa" }: PhonePreviewProps) {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[320px]">
        <div className="bg-gray-900 rounded-[2rem] p-2 shadow-xl">
          <div className="bg-white rounded-3xl overflow-hidden">
            <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                {contactName.charAt(0)}
              </div>
              <span className="text-white text-sm font-medium truncate">{contactName}</span>
            </div>
            {children}
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <div className="w-20 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}
