import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useQRForItem, useGenerateQR, useDeleteQR } from '../hooks/useQR';
import { formatTimeAgo } from '../utils/formatTimeAgo';

export default function QRTagSection({ item }) {
  const { data: tag, isLoading, isError, error } = useQRForItem(item._id);
  const generateMutation = useGenerateQR(item._id);
  const deleteMutation   = useDeleteQR(item._id);
  const containerRef     = useRef(null);

  const noTag      = isError && error?.response?.status === 404;
  const recoveryUrl = tag ? `${window.location.origin}/recover/${tag.token}` : '';

  const handleDownload = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) return;
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `qr-${item.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handleDelete = () => {
    if (!window.confirm('Remove QR tag? The QR code will stop working.')) return;
    deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="w-[200px] h-[200px] bg-gray-200 rounded-lg mx-auto" />
      </div>
    );
  }

  if (noTag) {
    return (
      <div className="text-center py-2">
        <p className="text-sm text-gray-500 mb-4">
          Create a QR code for this item so finders can contact you.
        </p>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {/* lock icon */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          {generateMutation.isPending ? 'Generating…' : 'Generate QR Tag'}
        </button>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-red-500 text-center py-4">
        Failed to load QR tag.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* QR canvas */}
      <div className="flex flex-col items-center gap-3">
        <div
          ref={containerRef}
          className="p-3 bg-white border border-gray-200 rounded-xl inline-block"
        >
          <QRCodeCanvas value={recoveryUrl} size={200} />
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Scan to view recovery page</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Scanned {tag.scannedCount ?? 0} time{tag.scannedCount !== 1 ? 's' : ''}
            {tag.lastScannedAt
              ? ` · Last: ${formatTimeAgo(tag.lastScannedAt)}`
              : ' · Never scanned'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
