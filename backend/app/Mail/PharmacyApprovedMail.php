<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PharmacyApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Eczaneniz Onaylandı - B2B Eczane Platformuna Hoş Geldiniz!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.pharmacy-approved',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
