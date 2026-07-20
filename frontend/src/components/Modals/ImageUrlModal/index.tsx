import { useState } from "react";
import { useModal } from "@stores/ModalStore/index";
import { Input, ErrorContainer } from "@components/index";
import ModalHeader from "../ModalHeader";
import ModalBody from "../ModalBody";
import ModalButtonContainer from "../ModalButtonContainer";
import { GenericButton } from "@components/Buttons";

function getErrorMessage(err: unknown): string {
    if (err && typeof err === "object" && "data" in err) {
        return (err as { data?: { message?: string } }).data?.message ?? "Something went wrong.";
    }

    return "Something went wrong.";
}

interface ImageUrlModalProps {
    title: string;
    onSubmit: (url: string) => Promise<unknown>;
}

export default function ImageUrlModal({ title, onSubmit }: ImageUrlModalProps) {
    const { closeModal } = useModal();

    const [url, setUrl] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const submit = () => {
        if (!/^https?:\/\/.+/i.test(url.trim())) return setError("Enter a valid image URL (must start with http:// or https://).");

        setLoading(true);
        setError("");

        onSubmit(url.trim())
            .then(() => closeModal())
            .catch((err) => {
                setError(getErrorMessage(err));
                setLoading(false);
            });
    };

    return (
        <>
            <ModalHeader>{title}</ModalHeader>

            <ModalBody style={{ flexDirection: "column", gap: 10 }}>
                <div>Paste a link to an image hosted anywhere (e.g. Imgur, Discord CDN, etc).</div>

                <Input
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(""); }}
                    placeholder="https://..."
                    autoComplete="off"
                />
            </ModalBody>

            {error !== "" && <ErrorContainer>{error}</ErrorContainer>}

            <ModalButtonContainer loading={loading}>
                <GenericButton onClick={submit}>Save</GenericButton>
                <GenericButton onClick={closeModal}>Cancel</GenericButton>
            </ModalButtonContainer>
        </>
    );
}
