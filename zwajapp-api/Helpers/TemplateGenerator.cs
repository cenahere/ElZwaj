using System.Text;
using AutoMapper;
using zwajapp_api.Data;
using zwajapp_api.Dtos;
using zwajapp_api.Helpers;

namespace ZwajApp.API.Helpers
{
    public class TemplateGenerator
    {
        private readonly IMapper _mapper;
        private readonly IZwajRepostiory _repo;

        public TemplateGenerator(IZwajRepostiory repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;

        }

        public string GetHTMLStringForUser(int userId)
        {
			//exception of Global Query Filter we use false
            // بيانات المستخدم
            var user = _repo.GetUser(userId, false).Result;
            // تاخذ القيمة من المستخدم وتحولة لشكل اخر
            var userToReturn = _mapper.Map<UserForDetailsDto>(user);
            // جلب المعجبين
            var likers = _repo.GetLikersOrLikees(userId, "likers").Result;
            // حلب المعجب بهم
            var likees = _repo.GetLikersOrLikees(userId, "likees").Result;
            // عدد المعجبين
            var likersCount=likers.Count;
            // عدد المعجب بهم
            var likeesCount=likees.Count;

            // ينتج string
            var sb = new StringBuilder();
            // اضافة حقول لل html  بداتا ثابتة
            sb.Append(@"
                        <html dir='rtl'>
                            <head>
                            </head>
                            <body>
                                <div class='page-header'><h2 class='header-container'>بطاقة " + userToReturn.KnownAs + @"</h2></div>
                                                             
                                <div class='card-data'>
                                
                                 <img src='" + /*القيم المتغيرة توضع بين @ " + variable + @ */ userToReturn.PhotoUrl + @"'>
                                <table style='display:inline;width: 50%;height: 300px;'>
                                <div>
                                <tr>
                                <td>الإسم</td>
                                    <td>" + userToReturn.KnownAs + @"</td>
                                </tr>
                                <tr>
                                    <td>العمر</td>
                                    <td>" + userToReturn.Age + @"</td>
                                </tr>    
                                <tr>
                                    <td>البلد</td>
                                    <td>" + userToReturn.Country + @"</td>
                                </tr>    
                                <tr>
                                    <td>تاريخ الإشتراك</td>
                                    <td>" + userToReturn.Created.ToShortDateString() + @"</td>
                                </tr> 
                                </div>   
                              </table>
                                </div>
                                <div class='page-header'><h2 class='header-container'>المعجبين &nbsp;&nbsp;["+likersCount+@"]</h2></div>
                                <table align='center'>
                                    <tr>
                                        <th>الإسم</th>
                                        <th>تاريخ الإشتراك</th>
                                        <th>العمر</th>
                                        <th>البلد</th>
                                    </tr>");

            foreach (var liker in likers)
            {
                // اضافة بيانات معينه علي شكل index
                sb.AppendFormat(@"<tr>
                                    <td>{0}</td>
                                    <td>{1}</td>
                                    <td>{2}</td>
                                    <td>{3}</td>
                                  </tr>", liker.KnownAs, liker.Created.ToShortDateString(), liker.DateOfBirth.CalculateAge(), liker.Country);
            }

            sb.Append(@"
                                </table>
                                <div class='page-header'><h2 class='header-container'>المعجب بهم  &nbsp;&nbsp;["+likeesCount+@"] </h2></div>
                                <table align='center'>
                                <tr>
                                 <th>الإسم</th>
                                        <th>تاريخ الإشتراك</th>
                                        <th>العمر</th>
                                        <th>البلد</th>
                                </tr>");
            foreach (var likee in likees)
            {
                sb.AppendFormat(@"<tr>
                                    <td>{0}</td>
                                    <td>{1}</td>
                                    <td>{2}</td>
                                    <td>{3}</td>
                                  </tr>", likee.KnownAs, likee.Created.ToShortDateString(), likee.DateOfBirth.CalculateAge(), likee.Country);
            }

            sb.Append(@"     </table>                   
                            </body>
                        </html>");

            return sb.ToString();
        }
		
    }
}