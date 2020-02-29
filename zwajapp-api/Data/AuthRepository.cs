using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using zwajapp_api.Models;

namespace zwajapp_api.Data
{
    public class AuthRepository : IAuthRepository
    {
        private readonly DataContext _context;
        public AuthRepository(DataContext context)
        {
            _context = context;

        }
        public async Task<User> Login(string userName, string password)
        {
            var user = await _context.Users.Include(p=>p.Photos).FirstOrDefaultAsync(x=>x.UserName==userName);
            if(user==null) return null;
            return user;
        }

        public async Task<User> Register(User user, string password)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> UserExists(string userName)
        {
            if(await _context.Users.AnyAsync(x=>x.UserName==userName)) return true;
            return false;
        }
    }
}