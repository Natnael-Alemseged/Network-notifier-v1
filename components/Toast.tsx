import { toast } from "sonner";

export enum ToastType {
    SUCCESS = "success",
    DANGER = "error",
    INFO = "info",
    WARNING = "warning"
}

export const toastBar = (message: string, type: ToastType = ToastType.INFO) => {
    switch (type) {
        case ToastType.SUCCESS:
            toast.success(message);
            break;
        case ToastType.DANGER:
            toast.error(message);
            break;
        case ToastType.WARNING:
            toast.warning(message);
            break;
        case ToastType.INFO:
        default:
            toast.message(message);
            break;
    }
};
