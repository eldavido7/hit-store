import { X, CreditCard, Coffee, ExternalLink } from 'lucide-react';

export default function DonationModal({ isOpen = false, onClose = () => { } }) {
    if (!isOpen) return null;

    const donationOptions = [
        {
            name: 'PayPal',
            description: 'Donate securely via PayPal',
            icon: CreditCard,
            url: 'https://www.paypal.com/donate/?hosted_button_id=Z6N3YYXCE5PVY',
            color: 'from-[#0070ba] to-[#1546a0]'
        },
        {
            name: 'Paystack',
            description: 'Secure payment via Paystack',
            icon: CreditCard,
            url: 'https://paystack.shop/pay/testers',
            color: 'from-[#bf5925] to-[#d67238]'
        },
        {
            name: 'Buy Me a Coffee',
            description: 'Support with a coffee',
            icon: Coffee,
            url: 'https://buymeacoffee.com/herimmigranttales',
            color: 'from-yellow-500 to-orange-500'
        }
    ];

    const handleOptionClick = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-[#bf5925] to-[#d67238] p-6 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold mb-2">Support Our Work</h2>
                    <p className="text-white/90 text-sm">Choose your preferred payment method</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                    {donationOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.name}
                                onClick={() => handleOptionClick(option.url)}
                                className="w-full group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-transparent hover:shadow-lg transition-all duration-300 p-5"
                            >
                                {/* Gradient background on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${option.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                                <div className="relative flex items-center gap-4">
                                    <div className={`p-3 rounded-full bg-gradient-to-r ${option.color}`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>

                                    <div className="flex-1 text-left">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-[#bf5925] transition-colors">
                                            {option.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">{option.description}</p>
                                    </div>

                                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#bf5925] transition-colors" />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <p className="text-center text-sm text-gray-500">
                        Your support helps us continue our mission. Thank you! ❤️
                    </p>
                </div>
            </div>
        </div>
    );
}