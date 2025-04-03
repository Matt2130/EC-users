import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://ecom-admin:ecom-admin@rabbitmq-ecommerce';
const RABBIT_EXCHANGE = "user_event";
const RABBIT_ROUTING_KEY = "user.created";
const RABBIT_EXCHANGE_PASS = "password_reset_event";
const RABBIT_ROUTING_KEY_PASS = "password.reset";

export async function userCreatedEvent(user) {
    const connection = await amqp.connect({
        protocol: 'amqp',
        hostname: process.env.RABBITMQ_HOST || RABBITMQ_URL,
        port:5672,
        username: process.env.RABBITMQ_USER || 'ecom-admin',
        password: process.env.RABBITMQ_PASSWORD || 'ecom-admin',
    });
    const channel = await connection.createChannel();

    //Create exchange if it didn´t created
    await channel.assertExchange(RABBIT_EXCHANGE, 'topic', { durable: true });

    //Publish the event
    const message = JSON.stringify(user);
    channel.publish(RABBIT_EXCHANGE, RABBIT_ROUTING_KEY, Buffer.from(message));

    console.log(`exchange "${RABBIT_EXCHANGE}",
        routing key "${RABBIT_ROUTING_KEY}": ${message}`);

    setTimeout(() => {
        connection.close()
    }, 500);
}

// Función para enviar un evento de recuperación de contraseña con el token
export async function sendPasswordResetEvent(user, resetToken) {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertExchange(RABBIT_EXCHANGE_PASS, "topic", { durable: true });

        // Crear el mensaje con el token de recuperación
        const message = JSON.stringify({
            id: user.id,
            username: user.username,
            resetToken: resetToken
        });

        channel.publish(RABBIT_EXCHANGE_PASS, RABBIT_ROUTING_KEY_PASS, Buffer.from(message));

        console.log(`exchange ${RABBIT_EXCHANGE_PASS}, routing key "${RABBIT_ROUTING_KEY_PASS}" : ${message}`);
        
        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.error('Error al enviar el evento de recuperación de contraseña:', error);
    }
}