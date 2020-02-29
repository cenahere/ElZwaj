using System.Collections.Generic;
using System.Threading.Tasks;
using ZwajApp.API.Helpers;
using zwajapp_api.Models;

namespace zwajapp_api.Data
{
    public interface IZwajRepostiory
    {
         void Add<T> (T entity) where T:class;
         void Delete<T> (T entity) where T:class;
         Task<bool> SaveAll();
         Task<User> GetUser (int  id, bool isCurrentUser);
         Task<PagedList<User>> GetUsers(UserParams userParams);
         Task<Photo> GetPhoto(int id);
         Task<Photo> GetMainPhotoForUser(int userId);

         Task<Like> GetLike(int userId , int reciptientId);

         Task<Message> GetMessage(int id);
         Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams);
         Task<IEnumerable<Message>> GetConverstion(int userId , int reciptientId);

           Task<int> GetUreadMessagesForUser(int userId);
           Task<Payment> GetPaymentForUser(int userId);

           Task<ICollection<User>> GetLikersOrLikees(int userId,string type);
    }
}