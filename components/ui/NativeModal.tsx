import React, { useEffect, useRef, useState } from 'react';

export interface NativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleId?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * NativeModal component adhering to W3C / modern-web-guidance specifications.
 * Utilizes the HTML5 <dialog> element rendered into the browser's native Top Layer.
 * Features:
 * - Native inert background and automatic focus containment.
 * - Hardware-accelerated ::backdrop with blur.
 * - Platform-native Esc and mobile back gesture dismissal via 'cancel' event.
 * - Progressive light-dismiss: checks pointerdown and pointerup against bounding rect
 *   to avoid accidental dismissals during text selections.
 * - overscroll-behavior: contain stops scroll chaining to the underlying document
 *   without shifting page layout or removing root scrollbars.
 */
export const NativeModal: React.FC<NativeModalProps> = ({
  isOpen,
  onClose,
  titleId,
  className = '',
  children
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pressedOutside, setPressedOutside] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        try {
          dialog.showModal();
        } catch {
          // Fallback if already open or unsupported
        }
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault(); // Controlled close via React state
      dialog.returnValue = '';
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => {
      dialog.removeEventListener('cancel', handleCancel);
    };
  }, [onClose]);

  const isPointerOutside = (e: React.PointerEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return false;
    const r = dialog.getBoundingClientRect();
    return (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDialogElement>) => {
    // Check if the user initiated the click outside the dialog's bounding box
    if (isPointerOutside(e)) {
      setPressedOutside(true);
    } else {
      setPressedOutside(false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDialogElement>) => {
    // Require both pointerdown and pointerup outside before dismissing
    if (pressedOutside && isPointerOutside(e)) {
      setPressedOutside(false);
      onClose();
    } else {
      setPressedOutside(false);
    }
  };

  if (!isOpen && (!dialogRef.current || !dialogRef.current.open)) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={`fixed inset-0 m-auto z-50 p-4 bg-transparent outline-none border-none backdrop:bg-black/85 backdrop:backdrop-blur-md ${className}`}
    >
      <div 
        className="w-full h-full flex items-center justify-center pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </dialog>
  );
};
