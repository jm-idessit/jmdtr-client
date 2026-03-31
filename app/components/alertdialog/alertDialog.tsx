import React from "react";

type AlertDialogProps = {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
};

const AlertDialog: React.FC<AlertDialogProps> = ({
    open,
    title = "Confirm Action",
    description = "Are you sure?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    loading = false,
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-sm p-6">

                <h2 className="text-lg font-semibold text-gray-800">
                    {title}
                </h2>

                <p className="text-sm text-gray-600 mt-2">
                    {description}
                </p>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                    >
                        {loading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertDialog;