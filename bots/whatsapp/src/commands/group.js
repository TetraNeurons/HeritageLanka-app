const client = require('../client');

module.exports = {
    creategroup: async (msg, args) => {
        // Usage: !creategroup Title number1 number2 ...
        const title = args.shift();
        const participants = args.map(num => num.includes('@c.us') ? num : `${num}@c.us`);

        try {
            await client.createGroup(title, participants);
            await msg.reply(`Created group "${title}"`);
        } catch (error) {
            console.error(error);
            await msg.reply('Failed to create group.');
        }
    },
    join: async (msg, args) => {
        const inviteCode = args[0];
        try {
            await client.acceptInvite(inviteCode);
            await msg.reply('Joined the group!');
        } catch (e) {
            await msg.reply('Invalid invite code.');
        }
    },
    leave: async (msg) => {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            await chat.leave();
        } else {
            await msg.reply('This command can only be used in a group!');
        }
    },
    subject: async (msg, args) => {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            const newSubject = args.join(' ');
            await chat.setSubject(newSubject);
        } else {
            await msg.reply('This command can only be used in a group!');
        }
    },
    desc: async (msg, args) => {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            const newDesc = args.join(' ');
            await chat.setDescription(newDesc);
        } else {
            await msg.reply('This command can only be used in a group!');
        }
    },
    addmembers: async (msg, args) => {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            const participants = args.map(num => num.includes('@c.us') ? num : `${num}@c.us`);
            await chat.addParticipants(participants);
            await msg.reply('Tried to add participants.');
        } else {
            await msg.reply('This command can only be used in a group!');
        }
    },
    promote: async (msg, args) => {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            const participants = await getParticipantsToUpdate(msg, args);
            if (participants.length > 0) {
                await chat.promoteParticipants(participants);
                await msg.reply('Promoted participants.');
            } else {
                await msg.reply('Please mention users or quote a message to promote.');
            }
        } else {
            await msg.reply('This command can only be used in a group!');
        }
    },
    demote: async (msg, args) => {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            const participants = await getParticipantsToUpdate(msg, args);
            if (participants.length > 0) {
                await chat.demoteParticipants(participants);
                await msg.reply('Demoted participants.');
            } else {
                await msg.reply('Please mention users or quote a message to demote.');
            }
        } else {
            await msg.reply('This command can only be used in a group!');
        }
    },
    kick: async (msg, args) => {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            const participants = await getParticipantsToUpdate(msg, args);
            if (participants.length > 0) {
                await chat.removeParticipants(participants);
                await msg.reply('Removed participants.');
            } else {
                await msg.reply('Please mention users or quote a message to kick.');
            }
        } else {
            await msg.reply('This command can only be used in a group!');
        }
    },
    revoke: async (msg) => {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            try {
                await chat.revokeInvite();
                await msg.reply('Revoked invite link.');
            } catch (e) {
                await msg.reply('Failed to revoke invite link. Bot might not be admin.');
            }
        } else {
            await msg.reply('This command can only be used in a group!');
        }
    },
    tagall: async (msg) => {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            let text = '*Everyone:*\n';
            let mentions = [];

            for (let participant of chat.participants) {
                const contact = await client.getContactById(participant.id._serialized);
                mentions.push(contact);
                text += `@${participant.id.user} `;
            }

            await chat.sendMessage(text, { mentions });
        } else {
            await msg.reply('This command can only be used in a group!');
        }
    },
    groupinfo: async (msg) => {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            await msg.reply(`
                *Group Details*
                Name: ${chat.name}
                Description: ${chat.description}
                Created At: ${chat.createdAt.toString()}
                Created By: ${chat.owner.user}
                Participant count: ${chat.participants.length}
            `);
        } else {
            await msg.reply('This command can only be used in a group!');
        }
    }
};

// Helper function to get participants from mentions or quoted message
async function getParticipantsToUpdate(msg, args) {
    let participants = [];
    if (msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage();
        participants.push(quotedMsg.author || quotedMsg.from);
    }
    if (msg.mentionedIds.length > 0) {
        participants.push(...msg.mentionedIds);
    }
    // Remove duplicates
    return [...new Set(participants)];
}
