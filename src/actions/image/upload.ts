"use client";

import { actionClient } from "@/lib/next-safe-action";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import z from "zod";

export const uploadImage = actionClient
  .inputSchema(
    z.object({
      image: z.file(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { image } = parsedInput;

    const abortController = new AbortController();

    const authenticator = async () => {
      try {
        const response = await fetch(`/api/upload-auth`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Request failed with status ${response.status}: ${errorText}`,
          );
        }

        const data = await response.json();
        const { signature, expire, token, publicKey } = data;
        return { signature, expire, token, publicKey };
      } catch (error) {
        console.error("Authentication error:", error);
        throw new Error("Authentication request failed");
      }
    };

    const handleUpload = async () => {
      // Access the file input element using the ref
      const fileInput = image;
      if (!fileInput || !fileInput) {
        alert("Please select a file to upload");
        return;
      }

      const file = fileInput;

      let authParams;
      try {
        authParams = await authenticator();
      } catch (authError) {
        console.error("Failed to authenticate for upload:", authError);
        return;
      }
      const { signature, expire, token, publicKey } = authParams;

      try {
        const uploadResponse = await upload({
          // Authentication parameters
          expire,
          token,
          signature,
          publicKey,
          file,
          fileName: file.name, // Optionally set a custom file name

          abortSignal: abortController.signal,
        });
        return uploadResponse.url;
      } catch (error) {
        // Handle specific error types provided by the ImageKit SDK.
        if (error instanceof ImageKitAbortError) {
          console.error("Upload aborted:", error.reason);
        } else if (error instanceof ImageKitInvalidRequestError) {
          console.error("Invalid request:", error.message);
        } else if (error instanceof ImageKitUploadNetworkError) {
          console.error("Network error:", error.message);
        } else if (error instanceof ImageKitServerError) {
          console.error("Server error:", error.message);
        } else {
          // Handle any other errors that may occur.
          console.error("Upload error:", error);
        }
      }
    };
    const imageUrl = await handleUpload();
    return imageUrl;
  });
