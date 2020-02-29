export interface Message
 {
    id : number;
    senderId: number;
    senderKhownAs : string;
    senderPhotoUrl : string;
    recipientId : number;
    recipientKhownAs : string;
    recipientPhotoUrl : string;
    content : string;
    isRead: boolean;
    dateRead : Date;
    messageSend : Date;
}
