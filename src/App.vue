<script lang="ts" setup>
import { createKeyPair, sign, verify, encrypt, decrypt } from "epolite";
import { defineComponent } from "vue";
</script>

<template>
    <h1>Test EPOLITE Encryption</h1>
    <p>
        Note: algorithms used are post-quantum, but I haven't audited them yet.
        <br>
        See the library used <a href="https://npmjs.com/epolite">here</a> for more info.
    </p>
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
            <br>
            <button @click="encryptMessage">Encrypt</button>
            <h3>Encrypted Message (Base64):</h3>
            <textarea readonly v-model="encryptedBase64"></textarea>
        </div>
    </div>

    <div class="decryption">
        <div class="input-section">
            <h2>Decrypt Message</h2>
            <textarea placeholder="Encrypted Base64" v-model="encryptedBase64ToDecrypt"></textarea>
            <br>
            <button @click="decryptMessage">Decrypt</button>
            <h3>Decrypted Plaintext:</h3>
            <textarea readonly v-model="decryptedPlaintext"></textarea>
        </div>
    </div>

    <div class="signing">
        <div class="input-section">
            <h2>Sign Message</h2>
            <textarea placeholder="Message" v-model="messageToSign"></textarea>
            <br>
            <button @click="signMessage">Sign</button>
            <h3>Signature (Base64):</h3>
            <textarea readonly v-model="signatureBase64"></textarea>
        </div>
    </div>
    
    <div class="verification">
        <div class="input-section">
            <h2>Verify Message</h2>
            <textarea placeholder="Signature (Base64)" v-model="signatureBase64ToVerify"></textarea>
            <br>
            <button @click="verifySignature">Verify</button>
            <h3>Verification Result:</h3>
            <p>{{ verificationResult }}</p>
        </div>
    </div>

    <!-- File Encryption Section -->
    <div class="file-encryption">
        <h2>Encrypt File</h2>
        <input type="file" @change="onFileSelectEncrypt">
        <br>
        <button @click="encryptFile">Encrypt File</button>
        <br>
        <a v-if="encryptedFileUrl" :href="encryptedFileUrl" :download="encryptedFileName || 'encrypted_file.epl'">Download Encrypted File</a>
    </div>

    <!-- File Decryption Section -->
    <div class="file-decryption">
        <h2>Decrypt File</h2>
        <input type="file" @change="onFileSelectDecrypt">
        <br>
        <button @click="decryptFile">Decrypt File</button>
        <br>
        <a v-if="decryptedFileUrl" :href="decryptedFileUrl" :download="decryptedFileName">Download Decrypted File</a>
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

.encryption,
.decryption,
.signing,
.verification,
.file-encryption,
.file-decryption {
    margin-top: 20px;
}

.file-decryption {
    margin-bottom: 50px;
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
            signatureBase64ToVerify: "",
            verificationResult: "",
            
            fileToEncrypt: null as File | null,
            encryptedFileUrl: "",
            fileToDecrypt: null as File | null,
            decryptedFileUrl: "",
            decryptedFileName: "",
            encryptedFileName: "",
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
            
            if (!this.signatureBase64ToVerify) {
                alert("Please enter a signature (base64) to verify.");
                return;
            }
            
            try {
                const isValid = await verify(
                    this.signatureBase64ToVerify,
                    this.publicKey
                );
                this.verificationResult = isValid ? "Signature is valid." : "Signature is NOT valid.";
            } catch (error: any) {
                alert("Verification failed: " + (error?.message || error));
            }
        },
        onFileSelectEncrypt(event: Event) {
            const input = event.target as HTMLInputElement;
            this.fileToEncrypt = input.files ? input.files[0] : null;
            this.encryptedFileName = this.fileToEncrypt?.name + '.epl';
        },
        async encryptFile() {
            if (!this.publicKey) {
                alert("Public key is required for encryption.");
                return;
            }
            
            if (!this.fileToEncrypt) {
                alert("Please select a file to encrypt.");
                return;
            }
            
            try {
                const fileReader = new FileReader();
                
                fileReader.onload = async (e) => {
                    const arrayBuffer = e.target?.result as ArrayBuffer;
                    
                    const base64Data = this.arrayBufferToBase64(arrayBuffer);
                    const encryptedData = await encrypt(base64Data, this.publicKey);
                    
                    const encryptedBlob = new Blob([encryptedData], { type: "text/plain;charset=utf-8" });
                    this.encryptedFileUrl = URL.createObjectURL(encryptedBlob);
                };
                
                fileReader.readAsArrayBuffer(this.fileToEncrypt);
                
            } catch (error: any) {
                alert("File encryption failed: " + (error?.message || error));
            }
        },
        onFileSelectDecrypt(event: Event) {
            const input = event.target as HTMLInputElement;
            this.fileToDecrypt = input.files ? input.files[0] : null;
        },
        async decryptFile() {
            if(!this.privateKey) {
                alert("Private key is required for decryption.");
                return;
            }
            
            if(!this.fileToDecrypt) {
                alert("Please select an encrypted file (.epl) to decrypt.");
                return;
            }
            
            try {
                const fileReader = new FileReader();
                
                fileReader.onload = async (e: any) => {
                    const encryptedData = e.target.result;
                    
                    const decryptedBase64Data = await decrypt(encryptedData, this.privateKey);
                    const decryptedArrayBuffer = this.base64ToArrayBuffer(decryptedBase64Data);
                    const decryptedBlob = new Blob([decryptedArrayBuffer], { type: "application/octet-stream" });
                    
                    const originalFileName = this.fileToDecrypt?.name.replace(/\.epl$/, '') || 'decrypted_file';
                    this.decryptedFileName = originalFileName;
                    
                    this.decryptedFileUrl = URL.createObjectURL(decryptedBlob);
                };
                
                fileReader.readAsText(this.fileToDecrypt, 'utf-8');
            } catch (error: any) {
                alert("File decryption failed: " + (error?.message || error));
            }
        },
        arrayBufferToBase64(buffer: ArrayBuffer) {
            let binary = '';
            
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            
            for(let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            
            return btoa(binary);
        },
        base64ToArrayBuffer(base64: string) {
            const binaryString = atob(base64);
            
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            
            for(let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            return bytes.buffer;
        },
    },
});
</script>
