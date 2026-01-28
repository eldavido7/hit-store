import QRCode from 'qrcode'
import { useEffect, useRef } from 'react'

export const QRCodeComponent = ({ value, size = 60 }: { value: string; size?: number }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (canvasRef.current && value) {
            QRCode.toCanvas(canvasRef.current, value, {
                width: size,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }, (error) => {
                if (error) console.error('QR Code generation error:', error)
            })
        }
    }, [value, size])

    return (
        <div className="bg-white p-1 rounded">
            <canvas
                ref={canvasRef}
                width={size}
                height={size}
                className="rounded"
            />
        </div>
    )
}