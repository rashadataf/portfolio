"use client";
import React, { useEffect, useRef, useCallback } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { toast } from 'sonner';

interface PublishCelebrationProps {
  open: boolean;
  title: string;
  url: string;
  onClose: () => void;
}

const random = (min: number, max: number) => Math.random() * (max - min) + min;

export const PublishCelebration: React.FC<PublishCelebrationProps> = ({ open, title, url, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  interface ConfettiParticle {
    x: number;
    y: number;
    w: number;
    h: number;
    speed: number;
    rotation: number;
    color: string;
  }

  const confettiParticles = useRef<ConfettiParticle[]>([]);

  const startConfetti = useCallback((): (() => void) | void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    confettiParticles.current = Array.from({ length: 80 }).map(() => ({
      x: random(0, canvas.width),
      y: random(-canvas.height, 0),
      w: random(6, 12),
      h: random(8, 16),
      speed: random(2, 6),
      rotation: random(0, Math.PI * 2),
      color: `hsl(${Math.floor(random(0, 360))}deg 85% 60%)`,
    }));

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiParticles.current.forEach((p) => {
        p.x += Math.cos(p.rotation) * 1;
        p.y += p.speed;
        p.rotation += 0.1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        if (p.y > canvas.height + 20) {
          p.x = random(0, canvas.width);
          p.y = random(-canvas.height, 0);
        }
      });
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);

    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    // Stop confetti after 4s
    setTimeout(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 4000);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (open) {
      const cancel = startConfetti();
      return () => cancel && cancel();
    }
  }, [open, startConfetti]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Unable to copy link');
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${title} — Read this on Rashadataf`);
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1400 }} />
      <Dialog open={open} onClose={onClose} aria-labelledby="publish-dialog-title">
        <DialogTitle id="publish-dialog-title">Article Published 🎉</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>{title}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Your article is live — share it with the world!</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={handleCopyLink}>Copy link</Button>
            <Button variant="contained" onClick={handleShareTwitter}>Share on Twitter</Button>
            <Button variant="contained" onClick={handleShareLinkedIn}>Share on LinkedIn</Button>
            <Button variant="text" href={url} target="_blank" rel="noreferrer">Open article</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PublishCelebration;
