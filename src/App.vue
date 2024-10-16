<script lang="ts" setup>

import { createKeyPair, sign, verify, encrypt, decrypt } from "epolite";
import { defineComponent } from "vue";
</script>

<template>
    <h1>Test EPOLITE Encryption</h1>
    <div class="keys">
        <div class="input-section">
            <h2>Input Public Key</h2>
            <textarea v-model="publicKey"></textarea>
        </div>
        <div class="input-section">
            <h2>Input Private Key</h2>
            <textarea v-model="privateKey"></textarea>
        </div>
    </div>
    <button @click="createKeys">Create New Keys</button>

    <div class="encryption">
        <div class="input-section">
            <h2>Encrypt Message</h2>
            <textarea placeholder="Plaintext" v-model="plaintextToEncrypt"></textarea>
            <button @click="encryptMessage">Encrypt</button>
            <h3>Encrypted Message (Base64):</h3>
            <textarea readonly v-model="encryptedBase64"></textarea>
        </div>
    </div>

    <div class="decryption">
        <div class="input-section">
            <h2>Decrypt Message</h2>
            <textarea placeholder="Encrypted Base64" v-model="encryptedBase64ToDecrypt"></textarea>
            <button @click="decryptMessage">Decrypt</button>
            <h3>Decrypted Plaintext:</h3>
            <textarea readonly v-model="decryptedPlaintext"></textarea>
        </div>
    </div>

    <div class="signing">
        <div class="input-section">
            <h2>Sign Message</h2>
            <textarea placeholder="Message" v-model="messageToSign"></textarea>
            <button @click="signMessage">Sign</button>
            <h3>Signature (Base64):</h3>
            <textarea readonly v-model="signatureBase64"></textarea>
        </div>
    </div>

    <div class="verification">
        <div class="input-section">
            <h2>Verify Signature</h2>
            <textarea placeholder="Original Message" v-model="originalMessageToVerify"></textarea>
            <textarea placeholder="Signature (Base64)" v-model="signatureBase64ToVerify"></textarea>
            <button @click="verifySignature">Verify</button>
            <h3>Verification Result:</h3>
            <p>{{ verificationResult }}</p>
        </div>
    </div>
</template>

<style>
.keys {
    display: flex;
    flex-direction: row;
}

.input-section {
    margin: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

textarea {
    width: 300px;
    height: 100px;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
}

button {
    margin-top: 10px;
    padding: 10px 20px;
}

.encryption, .decryption, .signing, .verification {
    margin-top: 20px;
}

@media screen and (max-width: 600px) {
    .keys {
        flex-direction: column;
    }
}
</style>

<script lang="ts">

export default defineComponent({
    data() {
        return {
            publicKey: "",
            privateKey: "",
            plaintextToEncrypt: "",
            encryptedBase64: "",
            encryptedBase64ToDecrypt: "",
            decryptedPlaintext: "",
            messageToSign: "",
            signatureBase64: "",
            originalMessageToVerify: "",
            signatureBase64ToVerify: "",
            verificationResult: "",
        };
    },
    methods: {
        async createKeys() {
            if (this.publicKey || this.privateKey) {
                const confirmOverwrite = confirm("Current keys will be overwritten. Continue?");
                if (!confirmOverwrite) return;
            }
            try {
                const kp = await createKeyPair();
                this.publicKey = kp.publicKey;
                this.privateKey = kp.privateKey;
            } catch (error: any) {
                alert("Failed to create key pair: " + (error?.message || error));
            }
        },
        async encryptMessage() {
            if (!this.publicKey) {
                alert("Public key is required for encryption.");
                return;
            }
            if (!this.plaintextToEncrypt) {
                alert("Please enter plaintext to encrypt.");
                return;
            }
            try {
                this.encryptedBase64 = await encrypt(this.plaintextToEncrypt, this.publicKey);
            } catch (error: any) {
                alert("Encryption failed: " + (error?.message || error));
            }
        },
        async decryptMessage() {
            if (!this.privateKey) {
                alert("Private key is required for decryption.");
                return;
            }
            if (!this.encryptedBase64ToDecrypt) {
                alert("Please enter encrypted base64 data to decrypt.");
                return;
            }
            try {
                this.decryptedPlaintext = await decrypt(this.encryptedBase64ToDecrypt, this.privateKey);
            } catch (error: any) {
                alert("Decryption failed: " + (error?.message || error));
            }
        },
        async signMessage() {
            if (!this.privateKey) {
                alert("Private key is required for signing.");
                return;
            }
            if (!this.messageToSign) {
                alert("Please enter a message to sign.");
                return;
            }
            try {
                this.signatureBase64 = await sign(this.messageToSign, this.privateKey);
            } catch (error: any) {
                alert("Signing failed: " + (error?.message || error));
            }
        },
        async verifySignature() {
            if (!this.publicKey) {
                alert("Public key is required for verification.");
                return;
            }
            if (!this.originalMessageToVerify) {
                alert("Please enter the original message to verify.");
                return;
            }
            if (!this.signatureBase64ToVerify) {
                alert("Please enter a signature (base64) to verify.");
                return;
            }
            try {
                const isValid = await verify(
                    this.originalMessageToVerify,
                    this.signatureBase64ToVerify,
                    this.publicKey
                );
                this.verificationResult = isValid ? "Signature is valid." : "Signature is invalid.";
            } catch (error: any) {
                alert("Verification failed: " + (error?.message || error));
            }
        },
    },
});
</script>
