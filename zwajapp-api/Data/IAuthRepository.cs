using System.Threading.Tasks;
using zwajapp_api.Models;

namespace zwajapp_api.Data
{
    public interface IAuthRepository
    {
         Task<User> Register (User user, string password);
         Task<User> Login (string userName , string password);
         Task<bool> UserExists (string userName);
         
    }
}