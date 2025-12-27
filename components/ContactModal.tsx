import React, { useState } from 'react';
import { PaperModal, PaperButton } from './PaperComponents';
import { Mail, Key, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PUBLIC_KEY_BLOCK = `-----BEGIN PGP PUBLIC KEY BLOCK-----
mQINBGlOxIABEACxdlW0TXE7tW7Xp5NsrZIM3q3Yczo4YM2 I0TiH8RWhZr1s9VCkfhV
qzMj6I/Svx zOA9GVwV37J4iePtXpRW2shSIHGeLfJJDV1Sal2OVzvTXSQl by3VELcbDe953fP0bQM3iDFccNBF/6Z1RxPLAqjG3E/NgJgtA8lB07/DIAOjcBjh38MvveLAbSRYhx9l4WUDhttpE7igyEkZYGVX28PkzM70sF4Pa0tT IqrYM5Ww0uffW0RLG7vXRD/t4DBh7guS1Wzqf7Rn2Sr1tWodmGS2JOeo SvdS/fYJz4ACVwPlSIWR9DxImht1I3IGNdoCtI7VCY2nj0rZX6Y0dUh20wiG LAdAne3bTXsAuxS3J5aUKeMhEsjkgp9slvQXNMqe2msmigVV25GQm4deg6YZo3DCKWPJIJ7RCmtblGd7oeMlkXExWzfxIID1Gx4G8qDnOlQWuB AwIxnjhPYgzX2iBw4ViMlTIC8VRa7reHe7rtBqfRVToxkkPoLw8iiKw1rNCnmP13Lkf7PpQ/FLColPlXSOj19mwuKXSmbfZYq9NMuIi4FL32jlH42HWRiODT2wzzGDiZ8tznvWxnmyBFgj U8p8SSj5RBanHBLanuHBl4sllt34AesbmY1qd2AJh54cUiasn8FmuYkplNinAGxFK12A7Kb 605qS6QARAQABtB5NZXRhY29nbmEuYWkgPGhpQG1ldGFjb2duYS5haT6JAlcEEwEIAEEWIQTk1lMu tbBYupzydtgmXDMX6/5HAUCaU7EgAIbAwUJB4YfZAULCQgHAgIiAgYVCgkICwIEFgIDAQIeAwIXgAAKCRBgmXDMX6/5HEOjD/49JuJndMk45c9HgEGUom5U8PxM6/sUeHkyrG3YLKuYr6TFvhHm9yE5vz8pAFckebiePXKrqClN09KnFddZEOw3nKccbCSjG5cfaW1sxtSf56jGSchCaT6H1dgI1wmuc6lLZpC6IiwRVj Usq3Xu6MXam7dEbLtc7cSERb 3g27f9FELjcgKoNyT92w32Y1PtyvlsSG9Zk/N kABQYh9ATc/w1w27zzIEUo0Ixe8MvNDfAfw CbengAQnyNYC8efSdXLKMTBNL9iEjVpBbHxwxC3JWyW/j/hx5pytkglRDnYm6h5dFRpwxiicw3SFjGPIEJ3AXNCnQVmsxrNRI HwGw5lN8NieS8h55D hpF5X t0/caj27KkMjpNk8rifHrX6fTtKddS4ul SZe2weFG32MwzS9OyS7RTbMG2VxCNleJJZjSMQ3mbJbhgwerDwuow3PkzBddggDP47Qok9Sw SzLmnn/OjmapRfcdwJyUkiXfBRDAm1G3xbMOSQX6v8bs386wwPlcEd/n 37hBNrHwI8H6BcDeD4AWewc2EvjT3GYzFMvhkdy5q 69cmOP9BImNgec27C2p1X8 nJIyqrUFvTAtvWxg ALi/bDs6opOy5 LHMf4k3uZr8RtIq2gNQMejQ8mEDCW Rh PW1Hsia8MUwssUb6/qSZ5e9QIRZrkCDQRpTsSAARAA3LIGRFpQ36eBf926CHLIVL2e3snw8QD JkJ4Cifvnr1gbjc4CP00orql5sxp9tNxQm17L65qR7ElbOPeB2D5WsPgQ1YdOklCQBsj6d2b2sFebaq1fvBJw/pCo O CON0ONIZTM3aqc2 KGhd89UdNa6Wst8fQl5rKNUpxfPaJuSXri59omcbutiVQYzB6ib7bNtgLl 8dQAoGbbc78O1SGsP/IsdDnYDlOzOY W5vZdPdVLEDnsyTBdJ0zIwdk25v7mmpmNwJaEO9an54f3nRqkRAmoIaC8MKvjIBstJEZ0kk8AdiUmT27ZGL6fdKwP9k6Mw0NpfAE2pp0HjLkeRaGIMkG7MOUH xApRoVMAQ/plYCgf3nFq6OY1d1XIIZ3tKpI8kznB6Y2/ds0v4vaCCQaWmfwieIe6tQ/ccDcLe/74p3vrAHIGmImDTTgQ8Z9EUwWe3NOyifqOaA2E0PCftDAfJfJeJSgfqsh3lsAKdgLFcxgMDOdUSyzCBPNW8iBOR2iH5naJsGQPx8g5yubDfm1D9zo/gB5fZrmuN6OnOUMiwG1pU1DGznvNn Ib/41MTAGh3 gRsYyxq8Yta1rrnN2X52T5fo5HTsnALArESPlCUP/3EZZIj5XPFLPuqpr34PklfXIhLdx44n85 asQEIjVVYinOMnPCroyw2pHhoMAEQEAAYkCPAQYAQgAJhYhBOTWUy761sFi6nPJ22CZcMxfr/kcBQJpTsSAAhsMBQkHhh9kAAoJEGCZcMxfr/kcsTsP/1RwG7FWzUHGvfFTNqrnBs63qiyj/craMvdsIWPyaRfb6s5rf0kuEmCVibS9zdLt52Pz2HPcZvaTuj22cHarkEG9fsrOh/vi4s8jHO54NzoKu1S2R60AXJErIhfi3dq2WZCuVGuzQdw iDRog7S4vhFTVBdJaRX/kd9/qvYgCqOKkkN5ZQKU2bQAOB4LcuDEEePSMZ1wKydX/xbvPeDIFsx7uF4AxHpBTTh6YO1xuUf682O9z70lb7/Rf5QO5OcJnV7ecpfGQZSz2ede8wlNQqDUlHRPQNRxUaaIGEC84i9F2WhIY3YouecQcLXMS4O/X3P/TvWVW57fJBzftmuDXMffVI7Lkl4L1sf6fC7RogrFNQu7epfzvfBQllFau5rQnbaSxoGYrEXoI8nYjBN7HH7GGb3b1bt67XWWBvXA9tDI60vYD2R6WSnWpuLufoPoHaNVumlbW9SK9Ad9/TNHL1o4K71pAcbkDIGg11rgz5B89JA/LJ/4MOl3wGYa7P3Q398J6QQvrPdXE 0g3GCNnV6cZ0UcxLhu 5Lz1U6JpDISo1SFKevRIELvnsK98KcQvrH6TaXlMZea3HHMgWJa0kTg1C/C lsCxigYuw0vIBe4CYr83fL4txe1p8uesWu4DBt85iMQjVL/n1WDRjIpzM7wiv4DGRMN3i0ub Y/reX8=hu9i-----END PGP PUBLIC KEY BLOCK-----`;

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);
    const [isKeyExpanded, setIsKeyExpanded] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(PUBLIC_KEY_BLOCK);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <PaperModal
            isOpen={isOpen}
            onClose={onClose}
            title="INITIATE_CONTACT_PROTOCOL_V1"
        >
            <div className="space-y-6 font-mono text-sm">
                <div className="bg-surface p-4 border border-ink border-dashed">
                    <p className="text-gray-600 mb-2">/// STATUS: LISTENING</p>
                    <p className="text-gray-600 mb-4">/// ENCRYPTION: RECOMMENDED BUT IGNORED</p>
                    
                    <div className="flex items-center gap-4 bg-white p-4 border border-ink shadow-sm mb-4 group hover:shadow-hard transition-shadow">
                        <div className="w-10 h-10 bg-accent flex items-center justify-center border border-ink">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <span className="block text-xs text-gray-400 uppercase font-bold">Signal Frequency</span>
                            <a href="mailto:hi@metacogna.ai" className="text-lg font-bold hover:text-accent">hi@metacogna.ai</a>
                        </div>
                    </div>

                    <div 
                        className="bg-ink text-paper relative overflow-hidden transition-all border-2 border-transparent hover:border-accent cursor-pointer group"
                        onClick={handleCopy}
                    >
                        <div 
                            className="flex justify-between items-center p-3 hover:bg-gray-800 transition-colors"
                        >
                             <div className="flex items-center gap-2 text-accent">
                                <Key className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">
                                    {copied ? "KEY COPIED TO CLIPBOARD" : "PUBLIC KEY (PGP - COMPLETELY UNNECESSARY (CLICK TO COPY))"}
                                </span>
                             </div>
                             <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsKeyExpanded(!isKeyExpanded); }} 
                                    className="text-gray-400 hover:text-white transition-colors p-1"
                                    title={isKeyExpanded ? "Collapse" : "Expand"}
                                >
                                    {isKeyExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                             </div>
                        </div>
                        
                        {isKeyExpanded && (
                            <div className="p-3 border-t border-gray-700 bg-[#0f0f11]" onClick={(e) => e.stopPropagation()}>
                                <code className="block break-all text-[9px] text-gray-400 font-mono leading-tight whitespace-pre-wrap max-h-64 overflow-y-auto">
                                    {PUBLIC_KEY_BLOCK}
                                </code>
                            </div>
                        )}
                        
                        {!isKeyExpanded && (
                            <div className="px-3 pb-2 pt-0 text-[9px] text-gray-500 truncate">
                                -----BEGIN PGP PUBLIC KEY BLOCK-----...
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <PaperButton onClick={onClose} variant="ghost" fullWidth>
                        ACKNOWLEDGE & CLOSE
                    </PaperButton>
                </div>
            </div>
        </PaperModal>
    );
};

export default ContactModal;