using Microsoft.AspNetCore.SignalR;
namespace zwajapp_api.Models 
{
    public class ChatHub : Hub {
        public async void refresh () {
            // await Clients.User( لو حابين يوزر محدد يوزع الخدمة)
            await Clients.All.SendAsync ("refresh");
        }

        public async void count(){
            // تذهب الرسالة ولكن العداد لا يزيد لابد من عمل Invoke
            await Clients.All.SendAsync("count");
        }
    }
}