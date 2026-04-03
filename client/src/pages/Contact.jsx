import React, { useState } from 'react'
import toast from 'react-hot-toast'
import {
    MdEmail,
    MdPhone,
    MdSchedule,
    MdLocationOn,
    MdSend,
    MdSupportAgent,
} from 'react-icons/md'

const Contact = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    })
    const [sending, setSending] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
            toast.error('Please fill in your name, email, and message.')
            return
        }
        setSending(true)
        window.setTimeout(() => {
            toast.success('Thanks! We will get back to you shortly.')
            setForm({ name: '', email: '', subject: '', message: '' })
            setSending(false)
        }, 600)
    }

    const infoItems = [
        {
            icon: MdEmail,
            title: 'Email',
            lines: ['hello@greencart.dev', 'support@greencart.dev'],
        },
        {
            icon: MdPhone,
            title: 'Phone',
            lines: ['+977 9818151385', 'Mon–Sat · 9:00 – 18:00'],
        },
        {
            icon: MdLocationOn,
            title: 'Visit',
            lines: ['Kirtipur 04,', 'Kathmandu'],
        },
        {
            icon: MdSchedule,
            title: 'Response time',
            lines: ['We usually reply within one business day.'],
        },
    ]

    return (
        <div className="mt-10 md:mt-14 pb-20 w-full">
            {/* Single column width matches hero + form row so everything lines up */}
            <div className="max-w-6xl mx-auto w-full flex flex-col gap-10 md:gap-12">
                <section className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/15 via-white to-emerald-50/80 border border-primary/10 px-6 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14">
                    <div
                        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl"
                        aria-hidden
                    />
                    <div className="relative max-w-2xl">
                        <p className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-medium text-primary shadow-sm border border-primary/15 mb-4">
                            <MdSupportAgent className="text-lg shrink-0" aria-hidden />
                            We are here to help
                        </p>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                            Let&apos;s talk about{' '}
                            <span className="text-primary">fresh groceries</span>
                        </h1>
                        <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                            Questions about an order, delivery, or partnership? Send us a message — our
                            team loves hearing from you.
                        </p>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 lg:items-stretch w-full">
                    <div className="lg:col-span-7 w-full min-w-0 flex flex-col lg:h-full">
                        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 md:p-8 flex flex-col flex-1 lg:min-h-0 h-full">
                            <h2 className="text-xl font-bold text-gray-900 mb-1 shrink-0">Send a message</h2>
                            <p className="text-sm text-gray-500 mb-6 shrink-0">
                                Fill out the form and we&apos;ll route it to the right team.
                            </p>
                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 gap-5">
                                <div className="grid sm:grid-cols-2 gap-5 shrink-0">
                                    <div>
                                        <label
                                            htmlFor="contact-name"
                                            className="block text-sm font-medium text-gray-700 mb-1.5"
                                        >
                                            Name
                                        </label>
                                        <input
                                            id="contact-name"
                                            name="name"
                                            type="text"
                                            autoComplete="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Your name"
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="contact-email"
                                            className="block text-sm font-medium text-gray-700 mb-1.5"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="contact-email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                                        />
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <label
                                        htmlFor="contact-subject"
                                        className="block text-sm font-medium text-gray-700 mb-1.5"
                                    >
                                        Subject{' '}
                                        <span className="text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <input
                                        id="contact-subject"
                                        name="subject"
                                        type="text"
                                        value={form.subject}
                                        onChange={handleChange}
                                        placeholder="Order, delivery, feedback…"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                                    />
                                </div>
                                <div className="flex flex-col flex-1 min-h-[140px] gap-1.5">
                                    <label
                                        htmlFor="contact-message"
                                        className="block text-sm font-medium text-gray-700 shrink-0"
                                    >
                                        Message
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        placeholder="How can we help?"
                                        className="w-full flex-1 min-h-[140px] rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25 resize-y"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="shrink-0 inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-white font-semibold hover:bg-primary-dull transition shadow-md shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {sending ? (
                                        'Sending…'
                                    ) : (
                                        <>
                                            <MdSend size={20} aria-hidden />
                                            Send message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    <aside className="lg:col-span-5 w-full min-w-0 flex flex-col lg:h-full">
                        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col flex-1 lg:min-h-0 h-full">
                            <div className="px-6 py-4 md:px-8 md:py-5 border-b border-gray-100 bg-gray-50/80 shrink-0">
                                <h2 className="text-lg font-bold text-gray-900">Contact details</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Reach us through any of the channels below.
                                </p>
                            </div>
                            <div className="flex-1 flex flex-col min-h-0 lg:justify-between">
                                {infoItems.map(({ icon: Icon, title, lines }, index) => (
                                    <div
                                        key={title}
                                        className={`flex gap-4 px-6 py-5 md:px-8 lg:flex-1 lg:items-start min-h-0 ${
                                            index !== infoItems.length - 1
                                                ? 'border-b border-gray-100'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Icon size={22} aria-hidden />
                                        </div>
                                        <div className="min-w-0 flex-1 pt-0.5">
                                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                                                {title}
                                            </h3>
                                            {lines.map((line) => (
                                                <p
                                                    key={line}
                                                    className="text-sm text-gray-600 mt-1 leading-relaxed"
                                                >
                                                    {line}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

export default Contact
